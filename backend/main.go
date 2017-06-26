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
	Users        map[uuid.UUID]User `json:"users"`         // All participators at the student division meeting.
	SpeakerLists [][]User           `json:"speakersLists"` // A list of speakerLists where each index is a list of sessions in queue to speak
}

type User struct {
	Nick    string `json:"nick"`
	IsAdmin bool   `json:"isAdmin"`
	id      uuid.UUID
	session *sessions.Session
}

const SESSION_KEY = "talarlista_session"
const UUID_KEY = "uuid"

var store = sessions.NewCookieStore([]byte("this is the secret stuff"))
var state State

func listHandler(w http.ResponseWriter, req *http.Request) {
	log.Print("Listhandler begin")
	session, err := store.Get(req, SESSION_KEY)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("Session is new %v\n", session.IsNew)
	if session.IsNew {
		var id = uuid.New()
		session.Values[UUID_KEY] = id.String()

		log.Printf("New user id: %v\n", id)

		state.addUser(User{"", false, id, session})
		log.Printf("State with new user: %v", state)
	}

	err = session.Save(req, w)
	if err != nil {
		log.Printf("Error when saving session to storage: %v", err)
	}


	session.Options = &sessions.Options{ // should this be done inside the previous if-statement?
		MaxAge:   86400,
		HttpOnly: true,
	}


	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	user, err := state.getUserFromSession(session)
	if err != nil {
		log.Printf("listHandler: Could not get user from session %v\n", err)
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

func (s State) getUserFromSession(session *sessions.Session) (User, error) {
	id, err := getUUIDfromSession(session)

	if err != nil {
		return User{}, err
	}

	return s.getUser(id)
}

func (s State) getUser(id uuid.UUID) (User, error) {
	user, ok := s.Users[id]

	if !ok {
		return User{}, errors.New("Could not find user")
	}
	return user, nil
}

func (s State) addUser(user User) bool {
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

	s.Users[id] = user
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

func listPost(w http.ResponseWriter, user User) {
	currentSpeakerList := state.SpeakerLists[len(state.SpeakerLists)-1]

	if isRegistered(user, currentSpeakerList) {
		http.Error(w, "{\"status\": \"already registered\"}", http.StatusUnprocessableEntity)
		return
	}
	// TODO check for name. A user needs a unique name to get to participate in a speakerList
	state.SpeakerLists[len(state.SpeakerLists)-1] = append(currentSpeakerList, user)
	w.Write([]byte("{\"status\": \"added\"}"))

}

func listDelete(w http.ResponseWriter, user User) {
	currentSpeakerList := state.SpeakerLists[len(state.SpeakerLists)-1]
	if isRegistered(user, currentSpeakerList) {
		state.SpeakerLists[len(state.SpeakerLists)-1] = removeUserFromList(user, currentSpeakerList)
		w.Write([]byte("{\"status\": \"removed\"}"))
	} else {
		http.Error(w, "{\"status\": \"not in a list\"}", http.StatusUnprocessableEntity)
		return
	}
}

func isRegistered(currentUser User, speakersList []User) bool {
	for _, user := range speakersList {
		if currentUser.id == user.id {
			return true
		}
	}
	return false
}

func removeUserFromList(user User, userList []User) []User {
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
	fmt.Printf("Session: %s\n", session)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if req.Method == http.MethodGet {
		user, err := state.getUserFromSession(session)
		if err != nil {
			log.Printf("Could not get user from session %v\n", err)
			//TODO add http error
			return
		}

		bytes, err := json.Marshal(user)
		w.Header().Set("Content-Type", "application/json")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		} else {
			w.Write(bytes)
		}
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
			w.Write([]byte("{\"status\":\"success\"}"))
		}
	}
}

func main() {
	log.SetFlags(log.Lshortfile)

	state.SpeakerLists = append(state.SpeakerLists, []User{})
	state.Users = make(map[uuid.UUID]User)

	mux := http.NewServeMux()
	mux.HandleFunc("/", listHandler)
	mux.HandleFunc("/list", listHandler)
	mux.HandleFunc("/admin", adminHandler)
	mux.HandleFunc("/me", userHandler)

	handler := cors.Default().Handler(mux)

	c := cors.New(cors.Options{
		//Debug: true,
		AllowedMethods: []string{"GET", "POST", "DELETE"},
	})
	handler = c.Handler(handler)

	handler = context.ClearHandler(handler)

	log.Print("About to listen on 3001. Go to http://127.0.0.1:3001/")
	//err := http.ListenAndServeTLS(":3001", "cert.pem", "key.pem", nil)
	err := http.ListenAndServe(":3001", handler)
	log.Fatal(err)
}
