package messages

import (
	"fmt"
	"github.com/google/uuid"
)

type JsonMessage struct {
	Message string `json:"msg"`
}

type AuthenticationRequest struct {
	Password string `json:"password"`
}

type ListActionData struct {
	Id uuid.UUID `json:"id"`
}

type SendEvent struct {
	Topic   string
	Content []byte
}

func (e SendEvent) String() string {
	return fmt.Sprintf("%s %s", e.Topic, string(e.Content))
}

const (
	CLIENT_HELO  = "CLIENT_HELO"
	USER_GET     = "USER_GET"
	USERS_GET    = "USERS_GET"
	USER_UPDATE  = "USER_UPDATE"
	USERS_UPDATE = "USERS_UPDATE"
	USER_DELETE  = "USER_DELETE"

	LIST_CREATE                = "LIST_CREATE"
	LIST_DELETE                = "LIST_DELETE"
	LIST_UPDATE                = "LIST_UPDATE"
	LIST_ADD_USER              = "LIST_ADD_USER"
	LIST_REMOVE_USER           = "LIST_REMOVE_USER"
	LIST_POP                   = "LIST_POP"
	LISTS_UPDATE               = "LISTS_UPDATE"
	LISTS_GET                  = "LISTS_GET"
	LIST_SET_DISCUSSION_STATUS = "LIST_SET_DISCUSSION_STATUS"
	LIST_ADMIN_ADD_USER        = "LIST_ADMIN_ADD_USER"

	ADMIN_LOGIN                = "ADMIN_LOGIN"
	ADMIN_GENERATE_PASSWORD    = "ADMIN_GENERATE_PASSWORD"
	ADMIN_UPDATE_PASSWORD_LIST = "ADMIN_UPDATE_PASSWORD_LIST"

	ERROR   = "ERROR"
	SUCCESS = "SUCCESS"

	USER_CONNECTION_CLOSED = "USER_CONNECTION_CLOSED"
	USER_CONNECTION_OPENED = "USER_CONNECTION_OPENED"
)
