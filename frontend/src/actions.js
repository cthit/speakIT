import backend from "./backend.js";
import store from "./store.js";

export const GET_USER = "GET_USER";
export const USER_UPDATE = "USER_UPDATE";
export const CLIENT_HELO = "CLIENT_HELO";
/*
const USER_DELETE = "USER_DELETE";

const LIST_NEW = "LIST_NEW";
const LIST_DELETE = "LIST_NEW";
const LIST_UPDATE = "LIST_UPDATE";
const LIST_ADD_USER = "LIST_ADD_USER";
const LIST_REMOVE_USER = "LIST_REMOVE_USER";
const LIST_FETCH = "LIST_FETCH";

const ADMIN_AUTHORIZE = "ADMIN_AUTHORIZE";

const ERROR = "ERROR";
*/

export const requestUser = () => {
	backend.socket.send(GET_USER);
};

export const requestUserUpdate = user => {
	backend.socket.send(USER_UPDATE + " " + JSON.stringify(user));
};

export const updateUser = user => {
	store.dispatch({ type: USER_UPDATE, user });
};

export const dispatchActionFromTopic = (topic, obj) => {
	switch (topic) {
		case USER_UPDATE:
			updateUser(obj);
			break;
		default:
	}
};
