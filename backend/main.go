package main

import (
	"github.com/gorilla/context"
	"github.com/gorilla/sessions"
	"github.com/rs/cors"
	"encoding/json"
	"log"
	"net/http"
)

type State struct {
	Participators []sessions.Session   // All participators at the student division meeting.
	SpeakerLists  [][]sessions.Session // A list of speakerLists where each index is a list of sessions in queue to speak
}

var store = sessions.NewCookieStore([]byte("this is the secret stuff"))
var state State

func listHandler(w http.ResponseWriter, req *http.Request) {
	log.Print("Listhandler begin")
	session, err := store.Get(req, "talarlista_session")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if session.IsNew {
		state.Participators = append(state.Participators, *session)
	}

	session.Options = &sessions.Options{
		MaxAge:   86400,
		HttpOnly: true,
	}

	session.Save(req, w)

	w.Header().Set("Content-Type", "text/plain")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	switch req.Method {
	case http.MethodGet:
		listGet(w, session)
	case http.MethodPost:
		listPost(w, session)
	case http.MethodDelete:
		listDelete(w, session)
	default:
		w.Write([]byte("List unsupported method.\n"))
		log.Print("Unsupported method")
	}
}

func listGet(w http.ResponseWriter, session *sessions.Session) {
	b, err := json.Marshal(state)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Write(b)
}

func listPost(w http.ResponseWriter, session *sessions.Session) {
	w.Write([]byte("List post.\n"))
	session.Values["registered"] = true

	currentSpeakerList := state.SpeakerLists[len(state.SpeakerLists)-1]

	if isRegistered(session, currentSpeakerList) {
		http.Error(w, "Already registered", http.StatusUnprocessableEntity)
		return
	} else {
		state.SpeakerLists[len(state.SpeakerLists)-1] = append(currentSpeakerList, *session)
		w.Write([]byte("Added to speakerslist"))
	}
}

func listDelete(w http.ResponseWriter, session *sessions.Session) {
	session.Values["registered"] = false
	currentSpeakerList := state.SpeakerLists[len(state.SpeakerLists)-1]
	if isRegistered(session, currentSpeakerList) {
		state.SpeakerLists[len(state.SpeakerLists)-1] = removeSessionFromList(session, currentSpeakerList)
		w.Write([]byte("Removed from speakerslist\n"))
	} else {
		http.Error(w, "Not in list", http.StatusUnprocessableEntity)
		return
	}

	w.Write([]byte("List delete.\n"))
}

func isRegistered(currentSession *sessions.Session, speakersList []sessions.Session) bool {
	for _, session := range speakersList {
		if (*currentSession).ID == session.ID {
			return true
		}
	}
	return false
}

func removeSessionFromList(session *sessions.Session, sessionList []sessions.Session) []sessions.Session {
	sessionIndex := -1
	for i, s := range sessionList {
		if (*session).ID == s.ID {
			sessionIndex = i
			break
		}
	}

	if sessionIndex == -1 {
		return sessionList
	} else {
		return append(sessionList[:sessionIndex], sessionList[sessionIndex+1:]...)
	}
}

func adminHandler(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Content-Type", "text/plain")
	w.Write([]byte("helo\n"))
}

func main() {
	state.SpeakerLists = append(state.SpeakerLists, []sessions.Session{})

	mux := http.NewServeMux()
	mux.HandleFunc("/", listHandler)
	mux.HandleFunc("/list", listHandler)
	mux.HandleFunc("/admin", adminHandler)

	handler := cors.Default().Handler(mux)

	c := cors.New(cors.Options{
		//Debug: true,
		AllowedMethods: []string{"GET", "POST", "DELETE"},
	})
	handler = c.Handler(handler)

	handler = context.ClearHandler(handler)

	log.Printf("About to listen on 3001. Go to http://127.0.0.1:3001/")
	//err := http.ListenAndServeTLS(":3001", "cert.pem", "key.pem", nil)
	err := http.ListenAndServe(":3001", handler)
	log.Fatal(err)
}
