package backend

type UserEvent struct {
	messageType  string
	user         *User
	ReceivedUser User        `json:"user"`
	Password     string      `json:"password"`
	UserId       string      `json:"userId"`
	ListId       string      `json:"listId"`
	List         SpeakerList `json:"list"`
}
