package backend

type UserEvent struct {
	messageType  string
	user         *User
	ReceivedUser User   `json:"user"`
	Password     string `json:"password"`
	Id           string `json:"id"`
}