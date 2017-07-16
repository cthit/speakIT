import { compose, createStore } from "redux";
import {
	USER_UPDATE,
	USERS_UPDATE,
	USER_GET_WAITING,
	LISTS_UPDATE,
	LISTS_GET_WAITING,
	LIST_WAITING,
	LIST_UPDATE,
	NOTES_EDIT
} from "./actions.js";

import throttle from "lodash/throttle";

import { loadState, saveState } from "./localStorage.js";

const initialState = loadState() || {
	user: {},
	users: [],
	adminCreatedUsers: [],
	listsGetWaiting: true,
	userGetWaiting: true,
	lists: []
};

function speakersList(state = initialState, action) {
	switch (action.type) {
		case USER_UPDATE:
			const { user } = action;
			return {
				...state,
				user,
				userGetWaiting: false
			};
		case USERS_UPDATE:
			console.log(action);
			const { usersObj: { users, adminCreatedUsers } } = action;
			return {
				...state,
				users,
				adminCreatedUsers: adminCreatedUsers || []
			};
		case USER_GET_WAITING:
			return { ...state, userGetWaiting: true };

		case LISTS_UPDATE:
			const { lists } = action;
			return { ...state, lists, listsGetWaiting: false };

		case LIST_UPDATE:
			const { list } = action;

			const newLists = state.lists.map(l => {
				if (l.id === list.id) {
					list.updating = false;
					return list;
				} else {
					return l;
				}
			});

			return { ...state, lists: newLists };

		case LISTS_GET_WAITING:
			return { ...state, listsGetWaiting: true };

		case LIST_WAITING:
			const { id } = action;

			const updatedLists = state.lists.map(list => {
				if (list.id === id) {
					list.updating = true;
				}
				return list;
			});

			return {
				...state,
				lists: updatedLists
			};
		case NOTES_EDIT:
			const { value } = action;
			return {
				...state,
				notes: value
			};
		default:
			return state;
	}
}

const enhancers = compose(
	window.__REDUX_DEVTOOLS_EXTENSION__
		? window.__REDUX_DEVTOOLS_EXTENSION__()
		: f => f
);

let store = createStore(speakersList, initialState, enhancers);

store.subscribe(
	throttle(() => {
		saveState(store.getState());
	}, 1000)
);

export default store;
