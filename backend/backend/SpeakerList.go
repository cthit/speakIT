package backend

import "github.com/google/uuid"

type SpeakerList struct {
	Title string `json:"title"`
	SpeakerQueue []*User `json:"speakersQueue"`
	Id uuid.UUID `json:"id"`
}

func (list *SpeakerList) RemoveUser(user *User) bool {
	userIndex := -1
	for i, u := range list.SpeakerQueue {
		if user.Id == u.Id {
			userIndex = i
			break
		}
	}

	var userFound = userIndex != -1
	if userFound {
		list.SpeakerQueue = append(list.SpeakerQueue[:userIndex], list.SpeakerQueue[userIndex+1:]...)
	}
	return userFound
}

func (list *SpeakerList) AddUser(user *User) bool {
	userFound := false
	for _, u := range list.SpeakerQueue {
		if user.Id == u.Id {
			userFound = true
			break
		}
	}

	if !userFound {
		list.SpeakerQueue = append(list.SpeakerQueue, user)
	}

	return !userFound
}