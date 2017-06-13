package main

import (
	"log"
	"net/http"
)

func listHandler(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Content-Type", "text/plain")
	w.Write([]byte("This is an example server.\n"))
}

func adminHandler(w http.ResponseWriter, req *http.Request) {
	w.Header().Set("Content-Type", "text/plain")
	w.Write([]byte("helo\n"))
}

func main() {
	http.HandleFunc("/", listHandler)
	http.HandleFunc("/list", listHandler)
	http.HandleFunc("/admin", adminHandler)

	log.Printf("About to listen on 3001. Go to http://127.0.0.1:3001/")
	//err := http.ListenAndServeTLS(":3001", "cert.pem", "key.pem", nil)
	err := http.ListenAndServe(":3001", nil)
	log.Fatal(err)
}
