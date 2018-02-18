package main

import (
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/tejpbit/talarlista/backend/messages"
	"log"
	"strings"
)

type User struct {
	Nick       string    `json:"nick"`
	Id         uuid.UUID `json:"id"`
	Connected  bool      `json:"connected"`
	IsAdmin    bool      `json:"isAdmin"`
	sockets    []*websocket.Conn
	hubChannel chan UserEvent
	input      chan messages.SendEvent
}

func CreateUser() *User {

	u := &User{
		Nick:       "",
		Id:         uuid.New(),
		Connected:  false,
		IsAdmin:    false,
		sockets:    []*websocket.Conn{},
		hubChannel: nil,
		input:      make(chan messages.SendEvent),
	}

	go u.handleSendEvents()
	
	return u
}

func (u *User) addSocket(socket *websocket.Conn) {
	u.sockets = append(u.sockets, socket)
}

func (u *User) ServeWS(conn *websocket.Conn) {
	u.sockets = append(u.sockets, conn)

	u.setupCloseHandler(conn)
	u.Connected = true

	go u.receiveFromWebsocket(conn)
	u.hubChannel <- UserEvent{messageType: messages.USER_CONNECTION_OPENED, user: u}
}

// setupCloseHandler sets a callback for conn
// run for each WS a user has.
func (u *User) setupCloseHandler(conn *websocket.Conn) {
	conn.SetCloseHandler(func(code int, text string) error {

		u.sockets = removeSocket(u.sockets, conn)
		if len(u.sockets) == 0 {
			u.Connected = false
		}

		u.hubChannel <- UserEvent{messageType: messages.USER_CONNECTION_CLOSED, user: u}
		return nil
	})
}

// removeSockets removes socket from sockets and returns the resulting slice of web socket connections
// if $socket is not in sockets, return @sockets as is
func removeSocket(sockets []*websocket.Conn, socket *websocket.Conn) []*websocket.Conn {
	socketIndex := -1
	for i, s := range sockets {
		if s == socket {
			socketIndex = i
		}
	}
	if socketIndex == -1 {
		return sockets
	}
	return append(sockets[:socketIndex], sockets[socketIndex+1:]...)

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

		parts := strings.SplitN(string(receivedBytes), " ", 2)
		if len(parts) < 1 {
			log.Printf("Wrong numer of parts, expected more than 1  and less than two, got %v", len(parts))
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

// handleSendEvents is an inf loop which reads from u.input and writes the content to all the users web sockets.
// Only one of these should run for each user.
func (u *User) handleSendEvents() {
	for {
		content := <-u.input
		for _, socket := range u.sockets {
			err := socket.WriteMessage(websocket.TextMessage, []byte(content.String()))
			if err != nil {
				log.Printf("Error when writing to socket for user %s: %v ", u.Nick, err)
				break
			}
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
