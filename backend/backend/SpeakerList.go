package backend

import (
	"github.com/google/uuid"
	"errors"
)

type SpeakerList struct {
	Title              string    `json:"title"`
	Id                 uuid.UUID `json:"id"`
	SpeakerQueue       queue   `json:"speakersQueue"`
	SecondSpeakerQueue queue   `json:"secondSpeakersQueue"`
	previousSpeakers   map[uuid.UUID]*User
}

type speakersQueue []*User

func CreateSpeakerList(title string) SpeakerList {
	return SpeakerList{
		Title:        title,
		SpeakerQueue: make([]*User, 0),
		SecondSpeakerQueue: make([]*User, 0),
		previousSpeakers: make(map[uuid.UUID]*User),
		Id:           uuid.New(),
	}
}

func (list *SpeakerList) Pop() (user *User, err error) {
	if len(list.SpeakerQueue) > 0 {
		user = list.SpeakerQueue[0]
		list.SpeakerQueue = list.SpeakerQueue[1:]
	} else if len(list.SecondSpeakerQueue) > 0 {
		user = list.SecondSpeakerQueue[0]
		list.SecondSpeakerQueue = list.SecondSpeakerQueue[1:]
	} else {
		err = errors.New("List is empty, cannot Pop")
		return
	}
	list.previousSpeakers[user.Id] = user
	return
}

func (list *SpeakerList) RemoveUser(user *User) (success bool) {
	success = list.SpeakerQueue.contains(user) || list.SecondSpeakerQueue.contains(user)
	list.SpeakerQueue = list.SpeakerQueue.remove(user)
	list.SecondSpeakerQueue = list.SecondSpeakerQueue.remove(user)
	return
}

func (list *SpeakerList) AddUser(user *User) bool {
	if _, isPreviousSpeaker := list.previousSpeakers[user.Id]; isPreviousSpeaker {
		userInQueue := list.SecondSpeakerQueue.contains(user)
		if !userInQueue {
			list.SecondSpeakerQueue = list.SecondSpeakerQueue.add(user)
		}
		return !userInQueue
	} else {
		userInQueue := list.SpeakerQueue.contains(user)
		if !userInQueue {
			list.SpeakerQueue = list.SpeakerQueue.add(user)
		}
		return !userInQueue
	}
}



type queue []*User

func (q queue) add(user *User) queue {
	alreadyInList := q.contains(user)
	if !alreadyInList {
		return append(q, user)
	}
	return q
}

func (q queue) remove(user *User) queue {
	i := q.index(user)
	if i == -1 {
		return q
	}
	return append(q[:i], q[i+1:]...)
}

func (q queue) index(user *User) int {
	i := -1
	for index, u := range q {
		if u.Id == user.Id {
			i = index
		}
	}
	return i
}

func (q queue) contains(user *User) bool {
	return q.index(user) >= 0
}