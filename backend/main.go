package main

import (
	"encoding/json"
	"errors"
	"github.com/google/uuid"
	"github.com/gorilla/context"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	garbler "github.com/michaelbironneau/garbler/lib"
	"github.com/rs/cors"
	"github.com/tejpbit/talarlista/backend/backend"
	"log"
	"net/http"
)

type State struct {
	Users        map[uuid.UUID]*backend.User `json:"users"`         // All participators at the student division meeting.
	SpeakerLists []*backend.SpeakerList      `json:"speakersLists"` // A list of speakerLists where each index is a list of sessions in queue to speak
}

type User struct {
	Nick    string `json:"nick"`
	IsAdmin bool   `json:"isAdmin"`
	id      uuid.UUID
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

func (s *State) updateUser(session *sessions.Session, user User) error {

	id, err := getUUIDfromSession(session)

	if err != nil {
		log.Printf("%s: %v\n", NoUUIDInSession, err)
		return errors.New(NoUUIDInSession)
	}

	storedUser, ok := s.Users[id]
	if !ok {
		log.Printf("Could not find user when updating: sessionId: \"%s\"", id)
		return errors.New(NoUserForUUID)
	}
	storedUser.Nick = user.Nick

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

func adminHandler(w http.ResponseWriter, req *http.Request) {
	user, err := state.getUserFromRequest(req)
	if err != nil {
		sendResponseWithCode(w, JsonMessage{err.Error()}, http.StatusUnauthorized)
		return
	}

	var authReq AuthenticationRequest

	err = json.NewDecoder(req.Body).Decode(&authReq)
	if err != nil {
		sendResponseWithCode(w, JsonMessage{err.Error()}, http.StatusBadRequest)
		return
	}

	passwordIndex := -1
	for i, k := range oneTimePasswords {
		if k == authReq.Password {
			passwordIndex = i
			break
		}
	}

	if passwordIndex != -1 {
		user.IsAdmin = true
		oneTimePasswords = append(oneTimePasswords[:passwordIndex], oneTimePasswords[passwordIndex+1:]...)
		sendUserReponse(w, user)
	} else {
		sendResponseWithCode(w, JsonMessage{"Wrong password"}, http.StatusUnauthorized)
	}
}

func userHandler(w http.ResponseWriter, req *http.Request) {
	session, err := store.Get(req, SESSION_KEY)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if req.Method == http.MethodGet {
		respondWithUserFromSession(w, session)
	} else if req.Method == http.MethodPost {

		var dat User
		decodeErr := json.NewDecoder(req.Body).Decode(&dat)
		if decodeErr != nil {
			log.Printf("Could not decode data %v\n", decodeErr)
			sendResponseWithCode(w, JsonMessage{decodeErr.Error()}, http.StatusBadRequest)
			return
		}

		err := state.updateUser(session, dat)
		if err != nil {
			log.Print("Could not update user data")
			sendResponseWithCode(w, JsonMessage{err.Error()}, http.StatusUnauthorized)
		} else {
			respondWithUserFromSession(w, session)
		}
	}
}

func notFound(w http.ResponseWriter, req *http.Request) {
	log.Print("In not found")
	http.Error(w, "Not found", http.StatusNotFound)
}

func sendUserReponse(w http.ResponseWriter, user *backend.User) {
	resp, err := json.Marshal(user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	} else {
		w.Write(resp)
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

func respondWithUserFromSession(w http.ResponseWriter, session *sessions.Session) {
	user, err := state.getUserFromSession(session)
	if err != nil {
		log.Printf("Could not get user from session: %v\n", err)
		sendResponseWithCode(w, JsonMessage{"No user for that session. Try clearing your cookies."}, http.StatusInternalServerError)
		return
	}

	sendUserReponse(w, user)
}

type UserMiddleware struct {
	handler http.Handler
	state   *State
}

func createUserMiddleware(handler http.Handler, state *State) *UserMiddleware {
	return &UserMiddleware{handler, state}
}

func (u *UserMiddleware) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	session, err := store.Get(req, SESSION_KEY)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if session.IsNew {
		var id = uuid.New()
		session.Values[UUID_KEY] = id.String()

		log.Printf("New user id: %v\n", id)

		u.state.addUser(&backend.User{"", false, id})

		session.Options = &sessions.Options{
			MaxAge:   86400,
			HttpOnly: true,
		}

		err = session.Save(req, w)

		if err != nil {
			log.Printf("Error when saving session to storage: %v\n", err)
		}
	}

	w.Header().Set("Content-Type", "application/json")

	_, err = state.getUserFromSession(session)
	if err != nil {
		log.Printf("User not found in middleware: %v\n", err)
		sendResponseWithCode(w, JsonMessage{"No user for this session. Clear your cookies to get a new session."}, http.StatusUnauthorized)
	} else {
		u.handler.ServeHTTP(w, req)
	}

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

	r := mux.NewRouter()
	r.StrictSlash(true)
	r.HandleFunc("/", notFound)
	r.HandleFunc("/lists", listHandler)
	r.HandleFunc("/lists/{id}", listWithIdHandler)
	r.HandleFunc("/admin", adminHandler)
	r.HandleFunc("/me", userHandler)
	serverMux := http.NewServeMux()
	serverMux.Handle("/", r)

	handler := http.Handler(createUserMiddleware(serverMux, &state))

	c := cors.New(cors.Options{
		//Debug: true,
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "DELETE"},
	})
	handler = c.Handler(handler)

	handler = context.ClearHandler(handler)

	log.Print("About to listen on 3001. Go to http://127.0.0.1:3001/")
	//err := http.ListenAndServeTLS(":3001", "cert.pem", "key.pem", nil)
	err := http.ListenAndServe(":3001", handler)
	log.Fatal(err)
}
