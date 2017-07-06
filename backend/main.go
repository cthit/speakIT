package main

import (
	"encoding/json"
	"errors"
	"github.com/google/uuid"
	"github.com/gorilla/context"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/gorilla/websocket"
	garbler "github.com/michaelbironneau/garbler/lib"
	"github.com/tejpbit/talarlista/backend/backend"
	"github.com/urfave/negroni"
	"log"
	"net/http"
	"strings"
)

type State struct {
	Users        map[uuid.UUID]*backend.User `json:"users"`         // All participators at the student division meeting.
	SpeakerLists []*backend.SpeakerList      `json:"speakersLists"` // A list of speakerLists where each index is a list of sessions in queue to speak
}

type JsonMessage struct {
	Message string `json:"msg"`
}

type AuthenticationRequest struct {
	Password string `json:"password"`
}

const (
	NoUserForSession   = "The provided session have no corresponding user in the state."
	NoUUIDInSession    = "The provided session does not contain a UUID for the user."
	NoUserForUUID      = "The UUID provided from the session does not correspond to a user in the state."
	UserIsNotAdmin     = "User is not admin"
	UserAlreadyInList  = "User already in list. Cannot be added twice."
	UserNotFoundInList = "User not in current list"
	NoListForUUID      = "The UUID does not correspond to any list"
)

const SESSION_KEY = "talarlista_session"
const UUID_KEY = "uuid"

var store = sessions.NewFilesystemStore("store", []byte("this is the secret stuff"))
var state State
var oneTimePasswords []string

func listHandler(w http.ResponseWriter, req *http.Request) {
	log.Print("In List handler")
	session, err := store.Get(req, SESSION_KEY)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	user, err := state.getUserFromSession(session)
	if err != nil {
		log.Printf("listHandler: Could not get user from session %v\n", err)
		sendResponseWithCode(w, JsonMessage{"Could not find the sessions corresponding user."}, http.StatusInternalServerError)
		return
	}
	log.Printf("User: %v\n", user)
	switch req.Method {
	case http.MethodGet:
		listGet(w)
	case http.MethodPost:
		listPost(w, user)
	case http.MethodDelete:
		listDelete(w, user)
	default:
		w.Write([]byte("List unsupported method.\n"))
		log.Print("Unsupported method")
	}
}

func listWithIdHandler(w http.ResponseWriter, req *http.Request) {
	session, err := store.Get(req, SESSION_KEY)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	user, err := state.getUserFromSession(session)
	if err != nil {
		log.Printf("listHandler: Could not get user from session %v\n", err)
		sendResponseWithCode(w, JsonMessage{"Could not find the sessions corresponding user."}, http.StatusInternalServerError)
		return
	}

	vars := mux.Vars(req)
	listId := vars["id"]
	log.Printf("List id from params %v", listId)
	log.Printf("List query from params %v", req.URL.Query())
	list, err := state.getListByString(listId)
	if err != nil {
		sendResponseWithCode(w, JsonMessage{err.Error()}, http.StatusNotFound)
	}

	switch req.Method {
	case http.MethodGet:
		sendListResponse(w, list)
	case http.MethodPost:
		ok := list.AddUser(user)
		if ok {
			sendListResponse(w, list)
		} else {
			sendResponseWithCode(w, JsonMessage{UserAlreadyInList}, http.StatusUnprocessableEntity)
		}
	case http.MethodDelete:
		ok := list.RemoveUser(user)
		if ok {
			sendListResponse(w, list)
		} else {
			sendResponseWithCode(w, JsonMessage{UserNotFoundInList}, http.StatusUnprocessableEntity)
		}
	default:
		sendResponseWithCode(w, JsonMessage{"Bad method"}, http.StatusMethodNotAllowed)
	}
}

func sendSuccessResponse(w http.ResponseWriter, details JsonMessage) {
	sendResponseWithCode(w, details, http.StatusOK)
}

func sendResponseWithCode(w http.ResponseWriter, details JsonMessage, code int) {
	content, err := json.Marshal(details)
	if err != nil {
		log.Printf("Could not marshal error response: %v", err)
	}
	w.WriteHeader(code)
	w.Write(content)
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

func (s *State) getListByString(id string) (*backend.SpeakerList, error) {
	parsedUUID, err := uuid.Parse(id)
	if err != nil {
		return nil, err
	}

	return s.getList(parsedUUID)
}

func (s *State) getList(id uuid.UUID) (*backend.SpeakerList, error) {

	for _, list := range s.SpeakerLists {
		if id == list.Id {
			return list, nil
		}
	}
	return nil, errors.New(NoListForUUID)
}

func (s State) getUserFromRequest(req *http.Request) (*backend.User, error) {
	session, err := store.Get(req, SESSION_KEY)
	if err != nil {
		log.Print()
		return nil, errors.New("Could not get session from storage")
	}
	return s.getUserFromSession(session)
}

func (s State) getUserFromSession(session *sessions.Session) (*backend.User, error) {
	id, err := getUUIDfromSession(session)

	if err != nil {
		return nil, err
	}

	return s.getUser(id)
}

func (s State) getUser(id uuid.UUID) (*backend.User, error) {
	user, ok := s.Users[id]

	if !ok {
		return nil, errors.New(NoUserForUUID)
	}
	return user, nil
}

func (s State) addUser(user *backend.User) bool {
	_, ok := s.Users[user.Id]
	if ok {
		return false
	}
	s.Users[user.Id] = user
	return true
}

func (s *State) updateUser(req *http.Request, user backend.User) error {
	oldUser, err := state.getUserFromRequest(req)

	if err != nil {
		log.Printf("%s: %v\n", NoUUIDInSession, err)
		return err
	}

	oldUser.Nick = user.Nick
	return nil
}

func listGet(w http.ResponseWriter) {
	b, err := json.Marshal(state.SpeakerLists)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Write(b)
}

func listPost(w http.ResponseWriter, user *backend.User) {
	currentSpeakerList := state.SpeakerLists[len(state.SpeakerLists)-1]

	ok := currentSpeakerList.AddUser(user)

	if ok {
		sendSuccessResponse(w, JsonMessage{"User added to list"})
	} else {
		sendResponseWithCode(w, JsonMessage{"User already in list. Cannot be added twice."}, http.StatusUnprocessableEntity)
	}
}

func listDelete(w http.ResponseWriter, user *backend.User) {
	currentSpeakerList := state.SpeakerLists[len(state.SpeakerLists)-1]
	ok := currentSpeakerList.RemoveUser(user)

	if ok {
		sendSuccessResponse(w, JsonMessage{"User removed from list"})
	} else {
		sendResponseWithCode(w, JsonMessage{"User not in current list"}, http.StatusUnprocessableEntity)
	}

}

func (s *State) tryAdminLogin(user *backend.User, authReq AuthenticationRequest) bool {
	passwordIndex := -1
	for i, k := range oneTimePasswords {
		if k == authReq.Password {
			passwordIndex = i
			break
		}
	}

	ok := passwordIndex != -1
	if ok {
		user.IsAdmin = true
		oneTimePasswords = append(oneTimePasswords[:passwordIndex], oneTimePasswords[passwordIndex+1:]...)
	}
	return ok
}

func notFound(w http.ResponseWriter, req *http.Request) {
	log.Print("In not found")
	http.Error(w, "Not found", http.StatusNotFound)
}

func sendListsResponse(conn *websocket.Conn, lists []*backend.SpeakerList) {
	listsObj, err := json.Marshal(lists)
	if err != nil {
		sendError(conn, err.Error())
	} else {
		resp := append([]byte(LISTS_UPDATE+" "), listsObj...)
		conn.WriteMessage(websocket.TextMessage, resp)
	}

}

func sendUserResponse(conn *websocket.Conn, user *backend.User) {
	userObj, err := json.Marshal(user)
	if err != nil {
		sendError(conn, err.Error())
	} else {
		resp := append([]byte(USER_UPDATE+" "), userObj...)
		conn.WriteMessage(websocket.TextMessage, resp)
	}
}

func sendListResponse(w http.ResponseWriter, list *backend.SpeakerList) {
	resp, err := json.Marshal(list)
	if err != nil {
		sendResponseWithCode(w, JsonMessage{err.Error()}, http.StatusInternalServerError)
	} else {
		w.Write(resp)
	}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func serveWs(w http.ResponseWriter, r *http.Request, _ http.HandlerFunc) {
	conn, err := upgrader.Upgrade(w, r, w.Header())
	if err != nil {
		log.Println(err)
		return
	}

	user, err := state.getUserFromRequest(r)
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
				sendListsResponse(conn, state.SpeakerLists)
			} else if messageType == USER_GET {
				sendUserResponse(conn, user)
			} else if messageType == USER_UPDATE {
				var receivedUser backend.User
				err = json.Unmarshal([]byte(parts[1]), &receivedUser)
				if err != nil {
					log.Printf("Could not unmarshal user %v", err)
					sendError(conn, err.Error())
					continue
				}
				state.updateUser(r, receivedUser)
				sendSuccess(conn, "User updated")
				sendUserResponse(conn, user)
			} else if messageType == ADMIN_LOGIN {
				var authRequest AuthenticationRequest
				err = json.Unmarshal([]byte(parts[1]), &authRequest)
				if err != nil {
					sendError(conn, err.Error())
					continue
				}
				ok := state.tryAdminLogin(user, authRequest)
				if ok {
					sendSuccess(conn, "Login successful.")
					sendUserResponse(conn, user)
				} else {
					sendError(conn, "Login failed.")
				}

			} else if messageType == LISTS_GET {
				sendListsResponse(conn, state.SpeakerLists)
			}
		}
	}()

}

func sendNotification(conn *websocket.Conn, topic, message string) {
	respObj, err := json.Marshal(JsonMessage{message})
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

const (
	CLIENT_HELO = "CLIENT_HELO"
	USER_GET    = "USER_GET"
	USER_UPDATE = "USER_UPDATE"
	USER_DELETE = "USER_DELETE"

	LIST_NEW         = "LIST_NEW"
	LIST_DELETE      = "LIST_NEW"
	LISTS_UPDATE     = "LISTS_UPDATE"
	LIST_ADD_USER    = "LIST_ADD_USER"
	LIST_REMOVE_USER = "LIST_REMOVE_USER"
	LISTS_GET        = "LISTS_GET"

	ADMIN_LOGIN = "ADMIN_LOGIN"

	ERROR   = "ERROR"
	SUCCESS = "SUCCESS"
)

type MessageHeader struct {
	MessageType string `json:"type"`
}

func userWithSession(w http.ResponseWriter, req *http.Request, next http.HandlerFunc) {

	session, err := store.Get(req, SESSION_KEY)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("Requested url %s", req.URL)

	if session.IsNew {
		var id = uuid.New()
		session.Values[UUID_KEY] = id.String()

		log.Printf("New user id: %v\n", id)

		state.addUser(&backend.User{"", false, id})
		log.Printf("State after new user: %v", state.Users)

		session.Options = &sessions.Options{
			MaxAge:   86400,
			HttpOnly: true,
		}

		err = session.Save(req, w)

		if err != nil {
			log.Printf("Error when saving session to storage: %v\n", err)
		}
	}

	next(w, req)
}

func main() {
	reqs := garbler.PasswordStrengthRequirements{
		MinimumTotalLength: 8,
		MaximumTotalLength: 8,
		Uppercase:          3,
		Digits:             2,
	}
	if initialPassword, err := garbler.NewPassword(&reqs); err != nil {
		log.Panicf("Could not generate initial password: %v", err)
	} else {
		oneTimePasswords = append(oneTimePasswords, initialPassword)
		log.Printf("First admin password is: %s", oneTimePasswords[0])
	}

	log.SetFlags(log.Lshortfile)

	state.SpeakerLists = []*backend.SpeakerList{
		{
			Title:        "Main list",
			SpeakerQueue: make([]*backend.User, 0),
			Id:           uuid.New(),
		}, {
			Title:        "Subdiscussion",
			SpeakerQueue: make([]*backend.User, 0),
			Id:           uuid.New(),
		},
	}
	state.Users = make(map[uuid.UUID]*backend.User)

	n := negroni.Classic()

	r := mux.NewRouter()
	r.Handle("/ws", negroni.New(negroni.HandlerFunc(userWithSession), negroni.HandlerFunc(serveWs)))
	r.HandleFunc("/", func(rw http.ResponseWriter, r *http.Request) {
		log.Printf("helo")
		rw.Write([]byte("Helohelo /"))
	})
	n.UseHandler(r)
	handler := context.ClearHandler(n)
	log.Print("About to listen on 3001. Go to http://127.0.0.1:3001/")
	err := http.ListenAndServe(":3001", handler)
	log.Fatal(err)
}
