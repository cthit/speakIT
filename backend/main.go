package main

import (
	"github.com/gorilla/context"
	"github.com/gorilla/mux"
	"github.com/urfave/negroni"
	"log"
	"net/http"
)


func main() {
	log.SetFlags(log.Lshortfile)
	hub := CreateHub()
	hub.Start()

	n := negroni.Classic()

	r := mux.NewRouter()
	r.HandleFunc("/ws", hub.ServeWs)
	r.HandleFunc("/", func(rw http.ResponseWriter, r *http.Request) {
		log.Printf("helo")
		rw.Write([]byte("Helohelo /"))
	})
	n.UseHandler(r)
	handler := context.ClearHandler(n)

	log.Print("About to listen on 3000. Go to http://127.0.0.1:3000/")
	err := http.ListenAndServe(":3000", handler)
	log.Fatal(err)
}
