package main

import (
	"encoding/json"
	"errors"
	"github.com/google/uuid"
	"github.com/gorilla/context"
	"github.com/gorilla/sessions"
	"github.com/rs/cors"
	"log"
	"net/http"
)

type State struct {
	Users        map[uuid.UUID]*User `json:"users"`         // All participators at the student division meeting.
	SpeakerLists [][]*User           `json:"speakersLists"` // A list of speakerLists where each index is a list of sessions in queue to speak
}

type User struct {
	Nick    string `json:"nick"`
	IsAdmin bool   `json:"isAdmin"`
	id      uuid.UUID
}

type JsonError struct {
	Message string `json:"msg"`
}

const SESSION_KEY = "talarlista_session"
const UUID_KEY = "uuid"

var store = sessions.NewFilesystemStore("store", []byte("this is the secret stuff"))
var state State

func listHandler(w http.ResponseWriter, req *http.Request) {
	session, err := store.Get(req, SESSION_KEY)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	user, err := state.getUserFromSession(session)
	if err != nil {
		log.Printf("listHandler: Could not get user from session %v\n", err)
		sendErrorResponse(w, JsonError{"Could not find the sessions corresponding user."}, http.StatusInternalServerError)
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

func sendErrorResponse(w http.ResponseWriter, details JsonError, code int) {
	content, err := json.Marshal(details)
	if err != nil {
		log.Printf("Could not marshal error response: %v", err)
	}
	http.Error(w, string(content), code)
}

func getUUIDfromSession(session *sessions.Session) (uuid.UUID, error) {
	storedValue, ok := session.Values[UUID_KEY]
	if !ok {
		return uuid.UUID{}, errors.New("Could not find user from session-stored UUID")
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

func (s State) getUserFromSession(session *sessions.Session) (*User, error) {
	id, err := getUUIDfromSession(session)

	if err != nil {
		return nil, err
	}

	return s.getUser(id)
}

func (s State) getUser(id uuid.UUID) (*User, error) {
	user, ok := s.Users[id]

	if !ok {
		return nil, errors.New("Could not find user")
	}
	return user, nil
}

func (s State) addUser(user *User) bool {
	_, ok := s.Users[user.id]
	if ok {
		return false
	}
	s.Users[user.id] = user
	return true
}

func (s *State) updateUser(session *sessions.Session, user User) bool {

	id, err := getUUIDfromSession(session)

	if err != nil {
		log.Printf("Could not get UUID from session %v\n", err)
		return false
	}

	storedUser, ok := s.Users[id]
	if !ok {
		log.Printf("Could not find user when updating: sessionId: \"%s\"", id)
		return false
	}
	storedUser.Nick = user.Nick

	return true
}

func listGet(w http.ResponseWriter) {
	b, err := json.Marshal(state.SpeakerLists)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Write(b)
}

func listPost(w http.ResponseWriter, user *User) {
	currentSpeakerList := state.SpeakerLists[len(state.SpeakerLists)-1]

	if isRegistered(user, currentSpeakerList) {
		http.Error(w, "{\"status\": \"already registered\"}", http.StatusUnprocessableEntity)
		return
	}
	// TODO check for name. A user needs a unique name to get to participate in a speakerList
	state.SpeakerLists[len(state.SpeakerLists)-1] = append(currentSpeakerList, user)
	w.Write([]byte("{\"status\": \"added\"}"))

}

func listDelete(w http.ResponseWriter, user *User) {
	currentSpeakerList := state.SpeakerLists[len(state.SpeakerLists)-1]
	if isRegistered(user, currentSpeakerList) {
		state.SpeakerLists[len(state.SpeakerLists)-1] = removeUserFromList(user, currentSpeakerList)
		w.Write([]byte("{\"status\": \"removed\"}"))
	} else {
		http.Error(w, "{\"status\": \"not in a list\"}", http.StatusUnprocessableEntity)
		return
	}
}

func isRegistered(currentUser *User, speakersList []*User) bool {
	for _, user := range speakersList {
		if currentUser.id == user.id {
			return true
		}
	}
	return false
}

func removeUserFromList(user *User, userList []*User) []*User {
	userIndex := -1
	for i, s := range userList {
		if user.id == s.id {
			userIndex = i
			break
		}
	}

	if userIndex == -1 {
		return userList
	} else {
		return append(userList[:userIndex], userList[userIndex+1:]...)
	}
}

func adminHandler(w http.ResponseWriter, req *http.Request) {

	w.Header().Set("Content-Type", "text/plain")
	w.Write([]byte("helo\n"))
}

func userHandler(w http.ResponseWriter, req *http.Request) {
	session, err := store.Get(req, SESSION_KEY)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if req.Method == http.MethodGet {
		respondWithUser(w, session)
	} else if req.Method == http.MethodPost {

		var dat User
		decodeErr := json.NewDecoder(req.Body).Decode(&dat)
		if decodeErr != nil {
			log.Printf("Could not decode data %v\n", decodeErr)
		}

		ok := state.updateUser(session, dat)
		if !ok {
			log.Print("Could not update user data")
			w.Write([]byte("{\"status\":\"fail\"}"))
		} else {
			respondWithUser(w, session)
		}
	}
}

func respondWithUser(w http.ResponseWriter, session *sessions.Session) {
	user, err := state.getUserFromSession(session)
	if err != nil {
		log.Printf("Could not get user from session: %v\n", err)
		sendErrorResponse(w, JsonError{"No user for that session. Try clearing your cookies."}, http.StatusInternalServerError)
		return
	}

	bytes, err := json.Marshal(user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	} else {
		w.Write(bytes)
	}
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

		u.state.addUser(&User{"", false, id})

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
		sendErrorResponse(w, JsonError{"Session does not correpond to user in state. Clear your cookies to get a new session."}, http.StatusInternalServerError)
	} else {
		u.handler.ServeHTTP(w, req)
	}

}

func main() {
	log.SetFlags(log.Lshortfile)

	state.SpeakerLists = append(state.SpeakerLists, []*User{})
	state.Users = make(map[uuid.UUID]*User)

	mux := http.NewServeMux()
	mux.HandleFunc("/", listHandler)
	mux.HandleFunc("/list", listHandler)
	mux.HandleFunc("/admin", adminHandler)
	mux.HandleFunc("/me", userHandler)

	c := cors.New(cors.Options{
		//Debug: true,
		AllowedOrigins: []string{"http://localhost:3000"},
		AllowCredentials: true,
		AllowedMethods: []string{"GET", "POST", "DELETE"},
	})
	handler := c.Handler(mux)

	handler = context.ClearHandler(handler)
	handler = createUserMiddleware(handler, &state)


	log.Print("About to listen on 3001. Go to http://127.0.0.1:3001/")
	//err := http.ListenAndServeTLS(":3001", "cert.pem", "key.pem", nil)
	err := http.ListenAndServe(":3001", handler)
	log.Fatal(err)
}
