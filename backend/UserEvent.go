package main

import "fmt"

type UserEvent struct {
	messageType  string
	user         *User
	ReceivedUser *User       `json:"user"`
	Password     string      `json:"password"`
	ListId       string      `json:"listId"`
	List         SpeakerList `json:"list"`
}

func (e UserEvent) String() string {
	return fmt.Sprintf(
		"{\n"+
			"\tmessageType: %s\n"+
			"\tuser: %v\n"+
			"\treceivedUser: %v\n"+
			"\tpassword: %v\n"+
			"\tlistId: %v\n"+
			"\tlist: %v\n"+
			"}", e.messageType, e.user, e.ReceivedUser, e.Password, e.ListId, e.List)
}
