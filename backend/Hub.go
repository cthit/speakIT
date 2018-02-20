package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/sessions"
	"github.com/gorilla/websocket"
	garbler "github.com/michaelbironneau/garbler/lib"
	"github.com/tejpbit/talarlista/backend/messages"
)

const SESSION_KEY = "talarlista_session"
const UUID_KEY = "uuid"

const (
	NoUserForSession   = "The provided session have no corresponding user in the state."
	NoUUIDInSession    = "The provided session does not contain a UUID for the user."
	NoUserForUUID      = "The UUID provided from the session does not correspond to a user in the state."
	UserIsNotAdmin     = "User is not admin"
	UserAlreadyInList  = "User already in list. Cannot be added twice."
	UserNotFoundInList = "User not in current list"
	NoListForUUID      = "The UUID does not correspond to any list"
)

type Hub struct {
	Users             map[uuid.UUID]*User
	AdminCreatedUsers map[uuid.UUID]*User
	SpeakerLists      []*SpeakerList
	connectedUsers    map[uuid.UUID]*User
	oneTimePasswords  []string
	input             chan UserEvent
	messageHandlers   map[string]MessageHandler
}

var reqs = garbler.PasswordStrengthRequirements{
	MinimumTotalLength: 8,
	MaximumTotalLength: 8,
	Uppercase:          3,
	Digits:             2,
}

var store = sessions.NewCookieStore([]byte("this is the secret stuff"))

func CreateHub() Hub {
	store.Options = &sessions.Options{
		MaxAge:   86400,
		HttpOnly: true,
	}

	speakerLists := []*SpeakerList{}

	hub := Hub{
		Users:             make(map[uuid.UUID]*User),
		AdminCreatedUsers: make(map[uuid.UUID]*User),
		SpeakerLists:      speakerLists,
		connectedUsers:    make(map[uuid.UUID]*User),
	}

	hub.generateNewPassword()
	hub.generateNewPassword()
	hub.generateNewPassword()

	hub.messageHandlers = CreateHandlers(&hub)
	return hub
}

func (hub *Hub) Start() error {
	if hub.input != nil {
		return errors.New("Hub already running")
	}
	hub.input = make(chan UserEvent, 10)
	for _, user := range hub.Users {
		user.hubChannel = hub.input
	}

	go hub.listenForUserEvents()
	return nil
}

func (hub *Hub) Broadcast(sendEvent messages.SendEvent) {
	for _, user := range hub.Users {
		user.input <- sendEvent
	}
}

func (hub *Hub) AdminBroadcast(sendEvent messages.SendEvent) {
	for _, user := range hub.Users {
		if user.IsAdmin {
			user.input <- sendEvent
		}
	}
}

func (hub *Hub) listenForUserEvents() {
	for {
		event := <-hub.input
		handler, ok := hub.messageHandlers[event.messageType]
		if !ok {
			sendError(event.user.input, fmt.Sprintf("No handler for the topic '%s'.", event.messageType))
			log.Printf("No handler for the topic '%s'", event.messageType)
			continue
		}
		handler.handle(event)
	}
}

func (hub *Hub) addUserToList(id uuid.UUID, user *User) error {
	listIndex := -1
	for i, list := range hub.SpeakerLists {
		if list.Id == id {
			listIndex = i
			break
		}
	}
	if listIndex == -1 {
		return errors.New("Could not find list for provided id")
	}
	list := hub.SpeakerLists[listIndex]
	ok := list.AddUser(user)
	if !ok {
		return errors.New("User already in list")
	}
	return nil
}

func (hub *Hub) removeUserFromList(id uuid.UUID, user *User) error {
	listIndex := -1
	for i, list := range hub.SpeakerLists {
		if list.Id == id {
			listIndex = i
			break
		}
	}
	if listIndex == -1 {
		return errors.New("Could not find list for provided id")
	}
	list := hub.SpeakerLists[listIndex]
	ok := list.RemoveUser(user)
	if !ok {
		return errors.New("User not in list")
	}
	return nil
}

func (hub *Hub) deleteList(id uuid.UUID) error {
	i := -1
	for index, list := range hub.SpeakerLists {
		if list.Id == id {
			i = index
		}
	}
	if i == -1 {
		return errors.New("List not found")
	}

	copy(hub.SpeakerLists[i:], hub.SpeakerLists[i+1:])
	hub.SpeakerLists[len(hub.SpeakerLists)-1] = nil
	hub.SpeakerLists = hub.SpeakerLists[:len(hub.SpeakerLists)-1]
	return nil
}

func (hub *Hub) getList(id uuid.UUID) (*SpeakerList, error) {

	for _, list := range hub.SpeakerLists {
		if id == list.Id {
			return list, nil
		}
	}
	return nil, errors.New(NoListForUUID)
}

func (hub Hub) getUserFromRequest(req *http.Request) (*User, error) {
	session, err := store.Get(req, SESSION_KEY)
	if err != nil {
		return nil, errors.New("Could not get session from storage")
	}
	return hub.getUserFromSession(session)
}

func (hub Hub) getUserFromSession(session *sessions.Session) (*User, error) {
	id, err := getUUIDfromSession(session)

	if err != nil {
		return nil, err
	}

	return hub.getUser(id)
}

func (hub Hub) getUser(id uuid.UUID) (*User, error) {
	user, ok := hub.Users[id]

	if !ok {
		return nil, errors.New(NoUserForUUID)
	}
	return user, nil
}

func (hub Hub) isUserNickTaken(nick string) bool {
	for _, user := range hub.Users {
		if user.Nick == nick {
			return true
		}
	}
	for _, user := range hub.AdminCreatedUsers {
		if user.Nick == nick {
			return true
		}
	}
	return false
}

func (hub Hub) addUser(user *User) bool {
	_, ok := hub.Users[user.Id]
	if ok {
		return false
	}
	hub.Users[user.Id] = user
	return true
}

func (hub Hub) updateUser(updatedUser *User) (success bool) {
	user, inUsers := hub.Users[updatedUser.Id]
	adminCreatedUser, inAdminCreatedUsers := hub.AdminCreatedUsers[updatedUser.Id]
	success = inUsers != inAdminCreatedUsers
	if !success {
		return
	}

	if inUsers {
		user.Nick = updatedUser.Nick
	} else if inAdminCreatedUsers {
		adminCreatedUser.Nick = updatedUser.Nick
	}

	return
}

func (hub Hub) deleteUser(user *User) {
	for _, list := range hub.SpeakerLists {
		list.RemoveUser(user)
	}
	delete(hub.AdminCreatedUsers, user.Id)
	delete(hub.Users, user.Id)
	delete(hub.connectedUsers, user.Id)
}

func (hub Hub) addAdminCreatedUser(user *User) bool {
	_, ok := hub.AdminCreatedUsers[user.Id]
	if ok {
		return false
	}
	user.Id = uuid.New()
	hub.AdminCreatedUsers[user.Id] = user
	return true
}

func (hub *Hub) tryAdminLogin(user *User, password string) bool {
	passwordIndex := -1
	for i, k := range hub.oneTimePasswords {
		if k == password {
			passwordIndex = i
			break
		}
	}

	ok := passwordIndex != -1
	if ok {
		user.IsAdmin = true
		hub.oneTimePasswords = append(hub.oneTimePasswords[:passwordIndex], hub.oneTimePasswords[passwordIndex+1:]...)
	}
	return ok
}

}

func (hub *Hub) generateNewPassword() {
	newPassword, err := garbler.NewPassword(&reqs)
	if err != nil {
		log.Panicf("Could not generate initial password: %v", err)
	}
	log.Printf("Generated password: %s", newPassword)
	hub.oneTimePasswords = append(hub.oneTimePasswords, newPassword)
}

func getUUIDfromSession(session *sessions.Session) (uuid.UUID, error) {
	storedValue, ok := session.Values[UUID_KEY]
	if !ok {
		return uuid.UUID{}, errors.New(NoUUIDInSession)
	}

	stringId, ok := storedValue.(string)
	if !ok {
		return uuid.UUID{}, errors.New("Could not cast stored value to string")
	}

	id, err := uuid.Parse(stringId)
	if err != nil {
		return uuid.UUID{}, errors.New("Could not parse stored string into uuid.UUID")
	}

	return id, nil
}

func (hub *Hub) ServeWs(w http.ResponseWriter, r *http.Request) {
	session, err := store.Get(r, SESSION_KEY)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if session.IsNew {
		newUser := CreateUser()
		session.Values[UUID_KEY] = newUser.Id.String()
		newUser.hubChannel = hub.input
		hub.addUser(newUser)

		err = session.Save(r, w)

		if err != nil {
			log.Printf("Error when saving session to storage: %v\n", err)
		}
	}

	conn, err := upgrader.Upgrade(w, r, w.Header())
	if err != nil {
		log.Println(err)
		return
	}

	user, err := hub.getUserFromRequest(r)
	if err != nil {
		errorResp, err := json.Marshal(messages.JsonMessage{Message: err.Error()})

		if err != nil {
			errorEvent := messages.SendEvent{Topic: messages.ERROR, Content: []byte(err.Error())}
			conn.WriteMessage(websocket.TextMessage, []byte(errorEvent.String()))
		} else {
			errorEvent := messages.SendEvent{Topic: messages.ERROR, Content: errorResp}
			conn.WriteMessage(websocket.TextMessage, []byte(errorEvent.String()))
		}
		conn.Close()
		return
	}

	user.ServeWS(conn)
}

func createListsResponse(lists []*SpeakerList) (messages.SendEvent, error) {
	listsObj, err := json.Marshal(lists)
	if err != nil {
		return messages.SendEvent{}, err
	} else {
		return messages.SendEvent{messages.LISTS_UPDATE, listsObj}, nil
	}
}

type UsersResponse struct {
	Users             []*User `json:"users"`
	AdminCreatedUsers []*User `json:"adminCreatedUsers"`
}

func (hub *Hub) createUsersResponse() (messages.SendEvent, error) {
	var users, adminCreatedUsers []*User
	for _, u := range hub.Users {
		users = append(users, u)
	}
	for _, u := range hub.AdminCreatedUsers {
		adminCreatedUsers = append(adminCreatedUsers, u)
	}

	usersUbj, err := json.Marshal(UsersResponse{Users: users, AdminCreatedUsers: adminCreatedUsers})
	if err != nil {
		return messages.SendEvent{}, err
	} else {
		return messages.SendEvent{messages.USERS_UPDATE, usersUbj}, nil
	}
}

func createListResponse(list *SpeakerList) (messages.SendEvent, error) {
	listObj, err := json.Marshal(list)
	if err != nil {
		return messages.SendEvent{}, err
	} else {
		return messages.SendEvent{messages.LIST_UPDATE, listObj}, nil
	}
}

func sendNotification(userChannel chan messages.SendEvent, topic, message string) {
	respObj, err := json.Marshal(messages.JsonMessage{message})
	if err != nil {
		log.Printf("Could not marshal error message: %v", err)
	}
	userChannel <- messages.SendEvent{topic, respObj}
}

func sendError(userChannel chan messages.SendEvent, message string) {
	sendNotification(userChannel, messages.ERROR, message)
}

func sendSuccess(userChannel chan messages.SendEvent, message string) {
	sendNotification(userChannel, messages.SUCCESS, message)
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}
