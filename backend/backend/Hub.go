package backend

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"github.com/gorilla/sessions"
	"github.com/gorilla/websocket"
	garbler "github.com/michaelbironneau/garbler/lib"
	"github.com/tejpbit/talarlista/backend/backend/messages"
	"log"
	"net/http"
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
	Users            map[uuid.UUID]*User
	SpeakerLists     []*SpeakerList
	connectedUsers   map[uuid.UUID]*User
	oneTimePasswords []string
	hubInput         chan UserEvent
	messageHandlers  map[string]MessageHandler
}

var store = sessions.NewFilesystemStore("store", []byte("this is the secret stuff"))

func CreateHub() Hub {
	reqs := garbler.PasswordStrengthRequirements{
		MinimumTotalLength: 8,
		MaximumTotalLength: 8,
		Uppercase:          3,
		Digits:             2,
	}

	speakerLists := []*SpeakerList{}

	initialPassword, err := garbler.NewPassword(&reqs)
	if err != nil {
		log.Panicf("Could not generate initial password: %v", err)
	}
	log.Printf("Generated password: %s", initialPassword)

	hub := Hub{
		Users:            make(map[uuid.UUID]*User),
		SpeakerLists:     speakerLists,
		connectedUsers:   make(map[uuid.UUID]*User),
		oneTimePasswords: []string{initialPassword},
	}
	hub.messageHandlers = CreateHandlers(&hub)
	return hub
}

func (h *Hub) Start() error {
	if h.hubInput != nil {
		return errors.New("Hub already running")
	}
	h.hubInput = make(chan UserEvent, 10)
	for _, user := range h.Users {
		user.hubChannel = h.hubInput
	}

	go h.listenForUserEvents()
	return nil
}

func (h *Hub) Broadcast(sendEvent messages.SendEvent) {
	for _, user := range h.Users {
		user.input <- sendEvent
	}
}

func (h *Hub) listenForUserEvents() {
	for {
		event := <-h.hubInput
		handler, ok := h.messageHandlers[event.messageType]
		if !ok {
			sendError(event.user.input, fmt.Sprintf("No handler for the topic '%s'.", event.messageType))
			log.Printf("No handler for the topic '%s'", event.messageType)
			continue
		}
		handler.handle(event)
	}
}

func (s *Hub) addUserToList(id uuid.UUID, user *User) error {
	listIndex := -1
	for i, list := range s.SpeakerLists {
		if list.Id == id {
			listIndex = i
			break
		}
	}
	if listIndex == -1 {
		return errors.New("Could not find list for provided id")
	}
	list := s.SpeakerLists[listIndex]
	ok := list.AddUser(user)
	if !ok {
		return errors.New("User already in list")
	}
	return nil
}

func (s *Hub) removeUserFromList(id uuid.UUID, user *User) error {
	listIndex := -1
	for i, list := range s.SpeakerLists {
		if list.Id == id {
			listIndex = i
			break
		}
	}
	if listIndex == -1 {
		return errors.New("Could not find list for provided id")
	}
	list := s.SpeakerLists[listIndex]
	ok := list.RemoveUser(user)
	if !ok {
		return errors.New("User not in list")
	}
	return nil
}

func (s *Hub) getList(id uuid.UUID) (*SpeakerList, error) {

	for _, list := range s.SpeakerLists {
		if id == list.Id {
			return list, nil
		}
	}
	return nil, errors.New(NoListForUUID)
}

func (s Hub) getUserFromRequest(req *http.Request) (*User, error) {
	session, err := store.Get(req, SESSION_KEY)
	if err != nil {
		return nil, errors.New("Could not get session from storage")
	}
	return s.getUserFromSession(session)
}

func (s Hub) getUserFromSession(session *sessions.Session) (*User, error) {
	id, err := getUUIDfromSession(session)

	if err != nil {
		return nil, err
	}

	return s.getUser(id)
}

func (s Hub) getUser(id uuid.UUID) (*User, error) {
	user, ok := s.Users[id]

	if !ok {
		return nil, errors.New(NoUserForUUID)
	}
	return user, nil
}

func (s Hub) addUser(user *User) bool {
	_, ok := s.Users[user.Id]
	if ok {
		return false
	}
	s.Users[user.Id] = user
	return true
}

func (s *Hub) tryAdminLogin(user *User, password string) bool {
	passwordIndex := -1
	for i, k := range s.oneTimePasswords {
		if k == password {
			passwordIndex = i
			break
		}
	}

	ok := passwordIndex != -1
	if ok {
		user.IsAdmin = true
		s.oneTimePasswords = append(s.oneTimePasswords[:passwordIndex], s.oneTimePasswords[passwordIndex+1:]...)
	}
	return ok
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
		var id = uuid.New()
		session.Values[UUID_KEY] = id.String()

		log.Printf("New user id: %v\n", id)

		hub.addUser(&User{"", false, id, hub.hubInput, nil})

		session.Options = &sessions.Options{
			MaxAge:   86400,
			HttpOnly: true,
		}

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
