package backend

import (
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/tejpbit/talarlista/backend/backend/messages"
	"log"
	"strings"
)

type User struct {
	Nick       string    `json:"nick"`
	IsAdmin    bool      `json:"isAdmin"`
	Id         uuid.UUID `json:"id"`
	hubChannel chan UserEvent
	input      chan messages.SendEvent
}

func (u *User) ServeWS(conn *websocket.Conn) {
	conn.SetCloseHandler(u.onWSClose)
	u.input = make(chan messages.SendEvent)
	u.hubChannel <- UserEvent{messageType: messages.USER_CONNECTION_OPENED, user: u}
	go u.receiveFromWebsocket(conn)
	go u.handleSendEvents(conn)
}

func (u *User) receiveFromWebsocket(conn *websocket.Conn) {
	for {
		_, receivedBytes, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				log.Printf("Unexpected close error: %v", err)
			} else {
				log.Printf("Connection going away: %v", err)
			}
			break
		}

		parts := strings.Split(string(receivedBytes), " ")
		if len(parts) < 1 || len(parts) > 2 {
			log.Printf("Wrong numer of parts, Expected 2 got %v", len(parts))
			sendError(u.input, fmt.Sprintf("Malformed request: '%v'", string(receivedBytes)))
			continue
		}

		var userEvent UserEvent
		if len(parts) == 2 {
			err = json.Unmarshal([]byte(parts[1]), &userEvent)
			if err != nil {
				sendError(u.input, err.Error())
				continue
			}
		}

		userEvent.messageType = parts[0]
		userEvent.user = u

		u.hubChannel <- userEvent
	}
}

func (u *User) handleSendEvents(conn *websocket.Conn) {
	for {
		content := <-u.input
		err := conn.WriteMessage(websocket.TextMessage, []byte(content.String()))
		if err != nil {
		    break
		}
	}
}

func sendUserResponse(userChannel chan messages.SendEvent, user *User) {
	userObj, err := json.Marshal(user)
	if err != nil {
		userChannel <- messages.SendEvent{messages.ERROR, []byte(err.Error())}
	} else {
		userChannel <- messages.SendEvent{messages.USER_UPDATE, userObj}
	}
}

func (u *User) onWSClose(code int, text string) error {
	u.input = nil
	u.hubChannel <- UserEvent{messageType:messages.USER_CONNECTION_CLOSED, user: u}
	return nil
}
