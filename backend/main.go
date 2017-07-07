package main

import (
	"github.com/gorilla/context"
	"github.com/gorilla/mux"
	"github.com/tejpbit/talarlista/backend/backend"
	"github.com/urfave/negroni"
	"log"
	"net/http"
)

var hub backend.Hub





//func userWithSession(w http.ResponseWriter, req *http.Request, next http.HandlerFunc) {
//
//	session, err := hub.Get(req, SESSION_KEY)
//	if err != nil {
//		http.Error(w, err.Error(), http.StatusInternalServerError)
//		return
//	}
//
//	log.Printf("Requested url %s", req.URL)
//
//	if session.IsNew {
//		var id = uuid.New()
//		session.Values[UUID_KEY] = id.String()
//
//		log.Printf("New user id: %v\n", id)
//
//		state.addUser(&backend.User{"", false, id})
//		log.Printf("State after new user: %v", state.Users)
//
//		session.Options = &sessions.Options{
//			MaxAge:   86400,
//			HttpOnly: true,
//		}
//
//		err = session.Save(req, w)
//
//		if err != nil {
//			log.Printf("Error when saving session to storage: %v\n", err)
//		}
//	}
//
//	next(w, req)
//}

func main() {
	log.SetFlags(log.Lshortfile)
	hub = backend.CreateHub()

	n := negroni.Classic()

	r := mux.NewRouter()
	r.HandleFunc("/ws", hub.ServeWs)
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
