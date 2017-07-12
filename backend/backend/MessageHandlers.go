package backend

import (
	"fmt"
	"github.com/google/uuid"
	"github.com/tejpbit/talarlista/backend/backend/messages"
)

type MessageHandler interface {
	handle(UserEvent)
}

type UserGet struct{}
type ClientHelo struct {
	hub *Hub
}
type UserUpdate struct {
	hub *Hub
}
type AdminLogin struct {
	hub *Hub
}
type ListsGet struct {
	hub *Hub
}
type ListAddUser struct {
	hub *Hub
}
type ListRemoveUser struct {
	hub *Hub
}
type UserConnectionOpened struct {
	hub *Hub
}
type UserConnectionClosed struct {
	hub *Hub
}
type ListCreate struct {
	hub *Hub
}
type ListDelete struct {
	hub *Hub
}
type ListPop struct {
	hub *Hub
}

func CreateHandlers(hub *Hub) map[string]MessageHandler {
	return map[string]MessageHandler{
		messages.CLIENT_HELO:            ClientHelo{hub},
		messages.USER_GET:               UserGet{},
		messages.USER_UPDATE:            UserUpdate{hub},
		messages.ADMIN_LOGIN:            AdminLogin{hub},
		messages.LISTS_GET:              ListsGet{hub},
		messages.LIST_ADD_USER:          ListAddUser{hub},
		messages.LIST_REMOVE_USER:       ListRemoveUser{hub},
		messages.USER_CONNECTION_OPENED: UserConnectionOpened{hub},
		messages.USER_CONNECTION_CLOSED: UserConnectionClosed{hub},
		messages.LIST_CREATE:            ListCreate{hub},
		messages.LIST_DELETE:            ListDelete{hub},
		messages.LIST_POP:               ListPop{hub},
	}
}

func (m ClientHelo) handle(userEvent UserEvent) {
	sendUserResponse(userEvent.user.input, userEvent.user)
	sendListsResponse(userEvent.user.input, m.hub.SpeakerLists)
}

func (m UserGet) handle(userEvent UserEvent) {
	sendUserResponse(userEvent.user.input, userEvent.user)
}

func (m UserUpdate) handle(userEvent UserEvent) {
	userEvent.user.Nick = userEvent.ReceivedUser.Nick
	sendUserResponse(userEvent.user.input, userEvent.user)
	resp, err := createListsResponse(m.hub.SpeakerLists)
	if err != nil {
		sendError(userEvent.user.input, err.Error())
	} else {
		m.hub.Broadcast(resp)
	}
}

func (m AdminLogin) handle(userEvent UserEvent) {
	ok := m.hub.tryAdminLogin(userEvent.user, userEvent.Password)
	if ok {
		sendSuccess(userEvent.user.input, "Login successful.")
		sendUserResponse(userEvent.user.input, userEvent.user)
	} else {
		sendError(userEvent.user.input, "Login failed.")
	}
}

func (m ListsGet) handle(userEvent UserEvent) {
	resp, err := createListsResponse(m.hub.SpeakerLists)
	if err != nil {
		sendError(userEvent.user.input, err.Error())
	} else {
		userEvent.user.input <- resp
	}

}

func (m ListAddUser) handle(userEvent UserEvent) {
	id, err := uuid.Parse(userEvent.Id)
	if err != nil {
		sendError(userEvent.user.input, err.Error())
		return
	}
	list, err := m.hub.getList(id)
	if err != nil {
		sendError(userEvent.user.input, err.Error())
		return
	}
	ok := list.AddUser(userEvent.user)
	if !ok {
		sendError(userEvent.user.input, UserAlreadyInList)
		return
	}

	resp, err := createListResponse(list)
	if err != nil {
		sendError(userEvent.user.input, err.Error())
	} else {
		m.hub.Broadcast(resp)
	}
}

func (m ListRemoveUser) handle(userEvent UserEvent) {
	id, err := uuid.Parse(userEvent.Id)
	if err != nil {
		sendError(userEvent.user.input, err.Error())
		return
	}
	list, err := m.hub.getList(id)
	if err != nil {
		sendError(userEvent.user.input, err.Error())
		return
	}
	ok := list.RemoveUser(userEvent.user)
	if !ok {
		sendError(userEvent.user.input, "User not in list.")
		return
	}

	resp, err := createListResponse(list)
	if err != nil {
		sendError(userEvent.user.input, err.Error())
	} else {
		m.hub.Broadcast(resp)
	}
}

func (m UserConnectionOpened) handle(UserEvent UserEvent) {
	m.hub.connectedUsers[UserEvent.user.Id] = UserEvent.user
}

func (m UserConnectionClosed) handle(UserEvent UserEvent) {
	delete(m.hub.connectedUsers, UserEvent.user.Id)

}

func (m ListCreate) handle(userEvent UserEvent) {
	if !userEvent.user.IsAdmin {
		sendError(userEvent.user.input, "Unauthorized biatch!")
		return
	}
	if userEvent.List.Title == "" {
		sendError(userEvent.user.input, "Can not create discussion with empty title")
		return
	}
	newList := CreateSpeakerList(userEvent.List.Title)
	m.hub.SpeakerLists = append(m.hub.SpeakerLists, &newList)
	resp, err := createListsResponse(m.hub.SpeakerLists)
	if err != nil {
		sendError(userEvent.user.input, fmt.Sprintf("Could not create new discussion, %v", err.Error()))
	} else {
		m.hub.Broadcast(resp)
	}
}

func (m ListDelete) handle(userEvent UserEvent) {
	if !userEvent.user.IsAdmin {
		sendError(userEvent.user.input, "Unauthorized biatch!")
		return
	}
	id, err := uuid.Parse(userEvent.Id)
	if err != nil {
		sendError(userEvent.user.input, err.Error())
		return
	}

	err = m.hub.deleteList(id)
	if err != nil {
		sendError(userEvent.user.input, err.Error())
		return
	}

	resp, err := createListsResponse(m.hub.SpeakerLists)
	if err != nil {
		sendError(userEvent.user.input, err.Error())
		return
	}
	m.hub.Broadcast(resp)
}

func (m ListPop) handle(userEvent UserEvent) {
	if !userEvent.user.IsAdmin {
		sendError(userEvent.user.input, "Unauthorized biatch!")
		return
	}
	id, err := uuid.Parse(userEvent.Id)
	if err != nil {
		sendError(userEvent.user.input, err.Error())
		return
	}

	list, err := m.hub.getList(id)
	if err != nil {
	    	sendError(userEvent.user.input, err.Error())
		return
	}
	_, err = list.Pop()
	if err != nil {
		sendError(userEvent.user.input, err.Error())
	}
	resp, err := createListResponse(list)
	if err != nil {
		sendError(userEvent.user.input, err.Error())
		return
	}
	m.hub.Broadcast(resp)

}

func sendListsResponse(userChannel chan messages.SendEvent, lists []*SpeakerList) {
	resp, err := createListsResponse(lists)
	if err != nil {
		sendError(userChannel, err.Error())
	} else {
		userChannel <- resp
	}

}
