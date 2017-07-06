import { createStore } from "redux";
import {
	USER_UPDATE,
	USER_GET_WAITING,
	LISTS_UPDATE,
	LISTS_GET_WAITING
} from "./actions.js";

const initialState = {
	user: {},
	listsGetWaiting: true,
	userGetWaiting: true
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
		case LISTS_GET_WAITING:
			return { ...state, listsGetWaiting: true };
		default:
			return state;
	}
}

let store = createStore(
	speakersList,
	window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
