package messages

import "github.com/google/uuid"

type JsonMessage struct {
	Message string `json:"msg"`
}

type AuthenticationRequest struct {
	Password string `json:"password"`
}

type ListActionData struct {
	Id uuid.UUID `json:"id"`
}

type MessageHeader struct {
	MessageType string `json:"type"`
}