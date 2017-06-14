package main

import (
	"log"
	"net/http"
	"github.com/rs/cors"
)

func listHandler(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Content-Type", "text/plain")
	w.Write([]byte("List requested.\n"))
}

func adminHandler(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Content-Type", "text/plain")
	w.Write([]byte("helo\n"))
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", listHandler)
	mux.HandleFunc("/list", listHandler)
	mux.HandleFunc("/admin", adminHandler)

	handler := cors.Default().Handler(mux)

	log.Printf("About to listen on 3001. Go to http://127.0.0.1:3001/")
	//err := http.ListenAndServeTLS(":3001", "cert.pem", "key.pem", nil)
	err := http.ListenAndServe(":3001", handler)
	log.Fatal(err)
}
