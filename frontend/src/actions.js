import backend from "./backend.js";
import store from "./store.js";
import { toast } from "react-toastify";

export const CLIENT_HELO = "CLIENT_HELO";

export const ERROR = "ERROR";
export const SUCCESS = "SUCCESS";

export const USER_GET = "USER_GET";
export const USER_UPDATE = "USER_UPDATE";
export const USER_GET_WAITING = "USER_GET_WAITING";

export const ADMIN_LOGIN = "ADMIN_LOGIN";
export const ADMIN_LOGIN_WAITING = "ADMIN_LOGIN_WAITING";

export const LISTS_GET = "LISTS_GET";
export const LISTS_UPDATE = "LISTS_UPDATE";
export const LISTS_GET_WAITING = "LISTS_GET_WAITING";
export const LIST_ADD_USER = "LIST_ADD_USER";
export const LIST_REMOVE_USER = "LIST_REMOVE_USER";
export const LIST_WAITING = "LIST_WAITING";
export const LIST_UPDATE = "LIST_UPDATE";
export const LIST_CREATE = "LIST_CREATE";
export const LIST_DELETE = "LIST_DELETE";
/*
const USER_DELETE = "USER_DELETE";
*/

export const sendClientHello = () => {
	backend.socket.send(CLIENT_HELO);
};

export const requestUser = () => {
	backend.socket.send(USER_GET);
	return { type: USER_GET_WAITING };
};

export const requestUserUpdate = user => {
	backend.socket.send(USER_UPDATE + " " + JSON.stringify(user));
	return { type: USER_GET_WAITING };
};

export const requestAdminLogin = password => {
	backend.socket.send(ADMIN_LOGIN + " " + JSON.stringify({ password }));
	return { type: ADMIN_LOGIN_WAITING };
};

export const requestLists = () => {
	backend.socket.send(LISTS_GET);
	return { type: LISTS_GET_WAITING };
};

export const updateUser = user => {
	return { type: USER_UPDATE, user };
};

export const updateLists = lists => {
	return { type: LISTS_UPDATE, lists };
};

export const updateList = list => {
	return { type: LIST_UPDATE, list };
};

export const requestAddUserToList = listId => {
	backend.socket.send(LIST_ADD_USER + " " + JSON.stringify({ id: listId }));
	return { type: LIST_WAITING, id: listId };
};

export const requestRemoveUserFromList = listId => {
	backend.socket.send(
		LIST_REMOVE_USER + " " + JSON.stringify({ id: listId })
	);
	return { type: LIST_WAITING, id: listId };
};

export const requestCreateList = listName => {
	backend.socket.send(
		LIST_CREATE + " " + JSON.stringify({ list: { title: listName } })
	);
	return { type: LIST_WAITING };
};

export const dispatchActionFromTopic = (topic, obj) => {
	switch (topic) {
		case USER_UPDATE:
			store.dispatch(updateUser(obj));
			break;
		case LISTS_UPDATE:
			store.dispatch(updateLists(obj));
			break;
		case LIST_UPDATE:
			store.dispatch(updateList(obj));
			break;
		case ERROR:
			toast.error(`Error report: ${obj.msg}`);
			break;
		case SUCCESS:
			toast.success(`${obj.msg}`);
			break;
		default:
	}
};
