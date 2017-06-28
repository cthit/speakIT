package backend

import "github.com/google/uuid"

type User struct {
	Nick    string `json:"nick"`
	IsAdmin bool   `json:"isAdmin"`
	Id      uuid.UUID
}
