package backend

import (
	"fmt"
	"github.com/google/uuid"
	"github.com/tejpbit/talarlista/backend/backend/messages"
	"log"
)

type MessageHandler interface {
	handle(UserEvent)
}

type ClientHelo struct {
	hub *Hub
}
type UserGet struct{}

type UsersGet struct {
	hub *Hub
}
type UserUpdate struct {
	hub *Hub
}
type UserDelete struct {
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
type ListSetDiscussionStatus struct {
	hub *Hub
}
type ListAdminAddUser struct {
	hub *Hub
}

func CreateHandlers(hub *Hub) map[string]MessageHandler {
	return map[string]MessageHandler{
		messages.CLIENT_HELO:                ClientHelo{hub},
		messages.USER_GET:                   UserGet{},
		messages.USERS_GET:                  UsersGet{hub},
		messages.USER_UPDATE:                UserUpdate{hub},
		messages.USER_DELETE:                UserDelete{hub},
		messages.ADMIN_LOGIN:                AdminLogin{hub},
		messages.LISTS_GET:                  ListsGet{hub},
		messages.LIST_ADD_USER:              ListAddUser{hub},
		messages.LIST_REMOVE_USER:           ListRemoveUser{hub},
		messages.USER_CONNECTION_OPENED:     UserConnectionOpened{hub},
		messages.USER_CONNECTION_CLOSED:     UserConnectionClosed{hub},
		messages.LIST_CREATE:                ListCreate{hub},
		messages.LIST_DELETE:                ListDelete{hub},
		messages.LIST_POP:                   ListPop{hub},
		messages.LIST_SET_DISCUSSION_STATUS: ListSetDiscussionStatus{hub},
		messages.LIST_ADMIN_ADD_USER:        ListAdminAddUser{hub},
	}
}

func (m ClientHelo) handle(userEvent UserEvent) {
	sendUserResponse(userEvent.user.input, userEvent.user)
	sendListsResponse(userEvent.user.input, m.hub.SpeakerLists)
	sendUsersUpdateToAdmins(m.hub, userEvent.user)
}

func (m UserGet) handle(userEvent UserEvent) {
	sendUserResponse(userEvent.user.input, userEvent.user)
}

func (m UsersGet) handle(userEvent UserEvent) {
	if !userEvent.user.IsAdmin {
		sendError(userEvent.user.input, "Unauthorized")
		return
	}

	resp, err := m.hub.createUsersResponse()
	if err != nil {
		sendError(userEvent.user.input, err.Error())
		return
	}
	userEvent.user.input <- resp
}

func (m UserUpdate) handle(userEvent UserEvent) {
	if userEvent.ReceivedUser.Nick == "" {
		sendError(userEvent.user.input, "Can't set empty nick.")
		return
	}
	if m.hub.isUserNickTaken(userEvent.ReceivedUser.Nick) {
		sendError(userEvent.user.input, "Nick is taken. If someone has taken your nick ask an admin to update or remove that user.")
		return
	}

	if userEvent.user.Id == userEvent.ReceivedUser.Id {
		userEvent.user.Nick = userEvent.ReceivedUser.Nick
		sendUserResponse(userEvent.user.input, userEvent.user)
	} else {
		if !userEvent.user.IsAdmin {
			sendError(userEvent.user.input, "Needs to be admin to update another users nick.")
			return
		}
		ok := m.hub.updateUser(userEvent.ReceivedUser)
		if !ok {
			sendError(userEvent.user.input, "Couldn't find user in ")
			return
		}

	}

	resp, err := createListsResponse(m.hub.SpeakerLists)
	if err != nil {
		sendError(userEvent.user.input, err.Error())
	} else {
		m.hub.Broadcast(resp)
	}
	sendUsersUpdateToAdmins(m.hub, userEvent.user)
}

func (m UserDelete) handle(userEvent UserEvent) {
	log.Println(userEvent.String())
	if !userEvent.user.IsAdmin {
		sendError(userEvent.user.input, "Unauthorized")
		return
	}

	if userEvent.ReceivedUser == nil {
		sendError(userEvent.user.input, "Received user is null")
		return
	}

	user, ok := m.hub.Users[userEvent.ReceivedUser.Id]
	if ok {
		sendNotification(user.input, messages.ERROR, "You have been removed from this hub by an admin.")
	}
	m.hub.deleteUser(userEvent.ReceivedUser)
	resp, err := createListsResponse(m.hub.SpeakerLists)
	if err != nil {
		sendError(userEvent.user.input, err.Error())
		return
	}
	userEvent.user.input <- resp
	sendUsersUpdateToAdmins(m.hub, userEvent.user)
}

func (m AdminLogin) handle(userEvent UserEvent) {
	ok := m.hub.tryAdminLogin(userEvent.user, userEvent.Password)
	if ok {
		sendSuccess(userEvent.user.input, "Login successful.")
		sendUserResponse(userEvent.user.input, userEvent.user)
		sendUsersUpdateToAdmins(m.hub, userEvent.user)
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
	id, err := uuid.Parse(userEvent.ListId)
	if err != nil {
		sendError(userEvent.user.input, err.Error())
		return
	}
	list, err := m.hub.getList(id)
	if err != nil {
		sendError(userEvent.user.input, err.Error())
		return
	}
	if list.Status == Closed && !userEvent.user.IsAdmin {
		sendError(userEvent.user.input, "Discussion is closed.")
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

func (m ListAdminAddUser) handle(userEvent UserEvent) {
	if !userEvent.user.IsAdmin {
		sendError(userEvent.user.input, "Unauthorized")
		return
	}

	id, err := uuid.Parse(userEvent.ListId)
	if err != nil {
		sendError(userEvent.user.input, err.Error())
		return
	}
	list, err := m.hub.getList(id)
	if err != nil {
		sendError(userEvent.user.input, err.Error())
		return
	}

	var adminCreatedUser *User
	adminCreatedUser, ok := m.hub.AdminCreatedUsers[userEvent.ReceivedUser.Id]
	if !ok {
		if userEvent.ReceivedUser.Nick == "" {
			sendError(userEvent.user.input, "Can't have empty nick.")
			return
		}
		if m.hub.isUserNickTaken(userEvent.ReceivedUser.Nick) {
			sendError(userEvent.user.input, "Nick already taken.")
			return
		}
		adminCreatedUser = CreateUser()
		adminCreatedUser.Nick = userEvent.ReceivedUser.Nick
		m.hub.addAdminCreatedUser(adminCreatedUser)
	}

	ok = list.AddUser(adminCreatedUser)
	if !ok {
		sendError(userEvent.user.input, UserAlreadyInList)
		return
	}

	resp, err := createListResponse(list)
	if err != nil {
		sendError(userEvent.user.input, err.Error())
		return
	} else {
		m.hub.Broadcast(resp)
	}
	sendUsersUpdateToAdmins(m.hub, userEvent.user)
}

func (m ListRemoveUser) handle(userEvent UserEvent) {
	id, err := uuid.Parse(userEvent.ListId)
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

func (m UserConnectionOpened) handle(userEvent UserEvent) {
	m.hub.connectedUsers[userEvent.user.Id] = userEvent.user
	sendUsersUpdateToAdmins(m.hub, userEvent.user)
}

func (m UserConnectionClosed) handle(userEvent UserEvent) {
	delete(m.hub.connectedUsers, userEvent.user.Id)
	sendUsersUpdateToAdmins(m.hub, userEvent.user)
}

func (m ListCreate) handle(userEvent UserEvent) {
	if !userEvent.user.IsAdmin {
		sendError(userEvent.user.input, "Unauthorized")
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
		sendError(userEvent.user.input, "Unauthorized")
		return
	}
	id, err := uuid.Parse(userEvent.ListId)
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
		sendError(userEvent.user.input, "Unauthorized")
		return
	}
	id, err := uuid.Parse(userEvent.ListId)
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

func (m ListSetDiscussionStatus) handle(userEvent UserEvent) {
	if !userEvent.user.IsAdmin {
		sendError(userEvent.user.input, "Unauthorized")
		return
	}
	id, err := uuid.Parse(userEvent.ListId)
	if err != nil {
		sendError(userEvent.user.input, err.Error())
		return
	}
	list, err := m.hub.getList(id)
	if err != nil {
		sendError(userEvent.user.input, err.Error())
		return
	}
	if !userEvent.List.Status.Valid() {
		sendError(userEvent.user.input, "Invalid status")
		return
	}
	list.Status = userEvent.List.Status
	resp, err := createListResponse(list)
	if err != nil {
		sendError(userEvent.user.input, err.Error())
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

func sendUsersUpdateToAdmins(hub *Hub, user *User) {
	resp, err := hub.createUsersResponse()
	if err != nil {
		sendError(user.input, err.Error())
		return
	}
	hub.AdminBroadcast(resp)
}
