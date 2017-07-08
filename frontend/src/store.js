import { createStore } from "redux";
import {
	USER_UPDATE,
	USER_GET_WAITING,
	LISTS_UPDATE,
	LISTS_GET_WAITING,
	LIST_WAITING,
	LIST_UPDATE
} from "./actions.js";

const initialState = {
	user: {},
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

		default:
			return state;
	}
}

let store = createStore(
	speakersList,
	window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
