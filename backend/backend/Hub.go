package backend

import (
	"encoding/json"
	"errors"
	"github.com/google/uuid"
	"github.com/gorilla/sessions"
	"github.com/gorilla/websocket"
	garbler "github.com/michaelbironneau/garbler/lib"
	"github.com/tejpbit/talarlista/backend/backend/messages"
	"log"
	"net/http"
	"strings"
	"time"
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

const (
	CLIENT_HELO = "CLIENT_HELO"
	USER_GET    = "USER_GET"
	USER_UPDATE = "USER_UPDATE"
	USER_DELETE = "USER_DELETE"

	LIST_NEW         = "LIST_NEW"
	LIST_DELETE      = "LIST_NEW"
	LISTS_UPDATE     = "LISTS_UPDATE"
	LIST_UPDATE     = "LIST_UPDATE"
	LIST_ADD_USER    = "LIST_ADD_USER"
	LIST_REMOVE_USER = "LIST_REMOVE_USER"
	LISTS_GET        = "LISTS_GET"

	ADMIN_LOGIN = "ADMIN_LOGIN"

	ERROR   = "ERROR"
	SUCCESS = "SUCCESS"
)

type Hub struct {
	Users            map[uuid.UUID]*User `json:"users"`         // All participators at the student division meeting.
	SpeakerLists     []*SpeakerList      `json:"speakersLists"` // A list of speakerLists where each index is a list of sessions in queue to speak
	oneTimePasswords []string
}

var store = sessions.NewFilesystemStore("store", []byte("this is the secret stuff"))

func CreateHub() Hub {
	reqs := garbler.PasswordStrengthRequirements{
		MinimumTotalLength: 8,
		MaximumTotalLength: 8,
		Uppercase:          3,
		Digits:             2,
	}

	speakerLists := []*SpeakerList{
		{
			Title:        "Main list",
			SpeakerQueue: make([]*User, 0),
			Id:           uuid.New(),
		}, {
			Title:        "Subdiscussion",
			SpeakerQueue: make([]*User, 0),
			Id:           uuid.New(),
		},
	}

	initialPassword, err := garbler.NewPassword(&reqs)
	if err != nil {
		log.Panicf("Could not generate initial password: %v", err)
	}

	return Hub{
		Users:            make(map[uuid.UUID]*User),
		SpeakerLists:     speakerLists,
		oneTimePasswords: []string{initialPassword},
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

func (s *Hub) updateUser(req *http.Request, user User) error {
	oldUser, err := s.getUserFromRequest(req)

	if err != nil {
		log.Printf("%s: %v\n", NoUUIDInSession, err)
		return err
	}

	oldUser.Nick = user.Nick
	return nil
}

func (s *Hub) tryAdminLogin(user *User, authReq messages.AuthenticationRequest) bool {
	passwordIndex := -1
	for i, k := range s.oneTimePasswords {
		if k == authReq.Password {
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

		hub.addUser(&User{"", false, id})

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
		sendError(conn, err.Error())
		conn.Close()
		return
	}

	go func() {
		for {
			_, receivedBytes, err := conn.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
					log.Printf("error: %v", err)
				}
				break
			}
			parts := strings.Split(string(receivedBytes), " ")
			if len(parts) < 1 || len(parts) > 2 {
				log.Printf("Wrong numer of parts, Expected 2 got %v", len(parts))
			}
			messageType := parts[0]

			if messageType == CLIENT_HELO {
				sendUserResponse(conn, user)
				sendListsResponse(conn, hub.SpeakerLists)
			} else if messageType == USER_GET {
				sendUserResponse(conn, user)
			} else if messageType == USER_UPDATE {
				var receivedUser User
				err = json.Unmarshal([]byte(parts[1]), &receivedUser)
				if err != nil {
					log.Printf("Could not unmarshal user %v", err)
					sendError(conn, err.Error())
					continue
				}
				hub.updateUser(r, receivedUser)
				sendSuccess(conn, "User updated")
				sendUserResponse(conn, user)
			} else if messageType == ADMIN_LOGIN {
				var authRequest messages.AuthenticationRequest
				err = json.Unmarshal([]byte(parts[1]), &authRequest)
				if err != nil {
					sendError(conn, err.Error())
					continue
				}
				ok := hub.tryAdminLogin(user, authRequest)
				if ok {
					sendSuccess(conn, "Login successful.")
					sendUserResponse(conn, user)
				} else {
					sendError(conn, "Login failed.")
				}

			} else if messageType == LISTS_GET {
				sendListsResponse(conn, hub.SpeakerLists)
			} else if messageType == LIST_ADD_USER {
				time.Sleep(time.Second)
				var listAction messages.ListActionData
				err := json.Unmarshal([]byte(parts[1]), &listAction)
				if err != nil {
					sendError(conn, err.Error())
					continue
				}

				list, err := hub.getList(listAction.Id)
				if err != nil {
					sendError(conn, err.Error())
					continue
				}
				ok := list.AddUser(user)
				if !ok {
					sendError(conn, UserAlreadyInList)
					continue
				}

				sendSuccess(conn, "User added to list")
				sendListResponse(conn, list)

			} else if messageType == LIST_REMOVE_USER {
				time.Sleep(time.Second)
				var listAction messages.ListActionData
				err := json.Unmarshal([]byte(parts[1]), &listAction)
				if err != nil {
					sendError(conn, err.Error())
					continue
				}
				list, err := hub.getList(listAction.Id)
				if err != nil {
					sendError(conn, err.Error())
					continue
				}
				list.RemoveUser(user)

				sendSuccess(conn, "User removed from list")
				sendListResponse(conn, list)
			}
		}
	}()

}

func sendListsResponse(conn *websocket.Conn, lists []*SpeakerList) {
	listsObj, err := json.Marshal(lists)
	if err != nil {
		sendError(conn, err.Error())
	} else {
		resp := append([]byte(LISTS_UPDATE+" "), listsObj...)
		conn.WriteMessage(websocket.TextMessage, resp)
	}

}

func sendListResponse(conn *websocket.Conn, list *SpeakerList) {
	listObj, err := json.Marshal(list)
	if err != nil {
		sendError(conn, err.Error())
	} else {
		resp := append([]byte(LIST_UPDATE+" "), listObj...)
		conn.WriteMessage(websocket.TextMessage, resp)
	}
}

func sendUserResponse(conn *websocket.Conn, user *User) {
	userObj, err := json.Marshal(user)
	if err != nil {
		sendError(conn, err.Error())
	} else {
		resp := append([]byte(USER_UPDATE+" "), userObj...)
		conn.WriteMessage(websocket.TextMessage, resp)
	}
}

func sendNotification(conn *websocket.Conn, topic, message string) {
	respObj, err := json.Marshal(messages.JsonMessage{message})
	if err != nil {
		log.Printf("Could not marshal error message: %v", err)
	}
	resp := append([]byte(topic+" "), respObj...)
	conn.WriteMessage(websocket.TextMessage, resp)
}

func sendError(conn *websocket.Conn, message string) {
	sendNotification(conn, ERROR, message)
}

func sendSuccess(conn *websocket.Conn, message string) {
	sendNotification(conn, SUCCESS, message)
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}
