import backend from "./backend.js";
import store from "./store.js";
import { toast } from "react-toastify";

export const USER_GET = "USER_GET";
export const USER_UPDATE = "USER_UPDATE";
export const USER_GET_WAITING = "USER_GET_WAITING";
export const ERROR = "ERROR";
export const SUCCESS = "SUCCESS";
export const ADMIN_LOGIN = "ADMIN_LOGIN";
/*
const USER_DELETE = "USER_DELETE";

const LIST_NEW = "LIST_NEW";
const LIST_DELETE = "LIST_NEW";
const LIST_UPDATE = "LIST_UPDATE";
const LIST_ADD_USER = "LIST_ADD_USER";
const LIST_REMOVE_USER = "LIST_REMOVE_USER";
const LIST_FETCH = "LIST_FETCH";



*/

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
};

export const updateUser = user => {
	return { type: USER_UPDATE, user };
};

export const dispatchActionFromTopic = (topic, obj) => {
	switch (topic) {
		case USER_UPDATE:
			store.dispatch(updateUser(obj));
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
