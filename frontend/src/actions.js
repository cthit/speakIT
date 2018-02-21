import backend from "./backend.js";
import store from "./store.js";
import { toast } from "react-toastify";

export const CLIENT_HELO = "CLIENT_HELO";

export const ERROR = "ERROR";
export const SUCCESS = "SUCCESS";

export const USER_GET = "USER_GET";
export const USER_UPDATE = "USER_UPDATE";
export const USER_DELETE = "USER_DELETE";
export const USERS_GET = "USERS_GET";
export const USERS_UPDATE = "USERS_UPDATE";
export const USER_GET_WAITING = "USER_GET_WAITING";
export const USER_REMOVE_WAITING = "USER_REMOVE_WAITING";
export const USERS_GET_WAITING = "USERS_GET_WAITING";

export const ADMIN_LOGIN = "ADMIN_LOGIN";
export const ADMIN_LOGIN_WAITING = "ADMIN_LOGIN_WAITING";
export const ADMIN_GENERATE_PASSWORD = "ADMIN_GENERATE_PASSWORD";
export const ADMIN_UPDATE_PASSWORD_LIST = "ADMIN_UPDATE_PASSWORD_LIST";
export const ADMIN_PASSWORD_WAITING = "ADMIN_PASSWORD_WAITING";

export const LISTS_GET = "LISTS_GET";
export const LISTS_UPDATE = "LISTS_UPDATE";
export const LISTS_GET_WAITING = "LISTS_GET_WAITING";
export const LIST_ADD_USER = "LIST_ADD_USER";
export const LIST_REMOVE_USER = "LIST_REMOVE_USER";
export const LIST_WAITING = "LIST_WAITING";
export const LIST_UPDATE = "LIST_UPDATE";
export const LIST_CREATE = "LIST_CREATE";
export const LIST_DELETE = "LIST_DELETE";
export const LIST_OPEN = "LIST_OPEN";
export const LIST_POP = "LIST_POP";
export const LIST_TITLE = "LIST_TITLE";
export const LIST_SET_DISCUSSION_STATUS = "LIST_SET_DISCUSSION_STATUS";
export const LIST_ADMIN_ADD_USER = "LIST_ADMIN_ADD_USER";

export const NOTES_EDIT = "NOTES_EDIT";

export const sendClientHello = () => {
  backend.send(CLIENT_HELO);
};

export const requestUser = () => {
  backend.send(USER_GET);
  return { type: USER_GET_WAITING };
};

export const requestUsers = () => {
  backend.socket.send(USERS_GET);
  return { type: USERS_GET_WAITING };
};

export const requestUserUpdate = user => {
  backend.send(USER_UPDATE, { user });
  return { type: USER_GET_WAITING };
};

export const requestUserDelete = user => {
  backend.socket.send(USER_DELETE + " " + JSON.stringify({ user }));
  return { type: USER_REMOVE_WAITING, user };
};

export const requestAdminLogin = password => {
  backend.send(ADMIN_LOGIN, { password });
  return { type: ADMIN_LOGIN_WAITING };
};

export const requestAdminGeneratePassword = () => {
  backend.send(ADMIN_GENERATE_PASSWORD);
  return { type: ADMIN_PASSWORD_WAITING };
};

export const requestLists = () => {
  backend.send(LISTS_GET);
  return { type: LISTS_GET_WAITING };
};

export const updateUser = user => {
  return { type: USER_UPDATE, user };
};

export const updateUsers = usersObj => {
  return { type: USERS_UPDATE, usersObj };
};

export const updateLists = lists => {
  return { type: LISTS_UPDATE, lists };
};

export const updateList = list => {
  return { type: LIST_UPDATE, list };
};

export const updatePasswordList = passwords => {
  return { type: ADMIN_UPDATE_PASSWORD_LIST, passwords };
};

export const requestAddUserToList = listId => {
  backend.send(LIST_ADD_USER, { listId });
  return { type: LIST_WAITING, listId };
};

export const requestRemoveUserFromList = listId => {
  backend.send(LIST_REMOVE_USER, { listId });
  return { type: LIST_WAITING, listId };
};

export const requestCreateList = listName => {
  backend.send(LIST_CREATE, { list: { title: listName } });
  return { type: LIST_CREATE };
};

export const requestDeleteList = listId => {
  backend.send(LIST_DELETE, { listId });
  return { type: LIST_WAITING, listId };
};

export const requestToggleCreateList = bool => {
  return { type: LIST_OPEN, bool };
};

export const requestPopList = listId => {
  backend.send(LIST_POP, { listId });
  return { type: LIST_WAITING, listId };
};

export const requestSetDiscussionStatus = (listId, status) => {
  backend.send(LIST_SET_DISCUSSION_STATUS, { listId, list: { status } });
  return { type: LIST_WAITING, listId };
};

export const setListTitle = title => ({
  type: LIST_TITLE,
  title
});

export const notesEdit = value => {
  return { type: NOTES_EDIT, value };
};

export const requestListAdminAddUser = (listId, nick) => {
  backend.send(LIST_ADMIN_ADD_USER, {
    listId,
    user: { nick }
  });
  return { type: LIST_WAITING, listId };
};

export const error = err => {
  return { type: ERROR, err };
};

export const dispatchActionFromTopic = (topic, obj) => {
  switch (topic) {
    case USER_UPDATE:
      store.dispatch(updateUser(obj));
      break;
    case USERS_UPDATE:
      store.dispatch(updateUsers(obj));
      break;
    case LISTS_UPDATE:
      store.dispatch(updateLists(obj));
      break;
    case LIST_UPDATE:
      store.dispatch(updateList(obj));
      break;
    case ADMIN_UPDATE_PASSWORD_LIST:
      store.dispatch(updatePasswordList(obj));
      break;
    case ERROR:
      toast.error(obj.msg);
      store.dispatch(error(obj));
      break;
    case SUCCESS:
      toast.success(obj.msg);
      break;
    default:
  }
};
