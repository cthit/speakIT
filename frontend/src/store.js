import { createStore } from "redux";
import { USER_UPDATE, USER_GET_WAITING } from "./actions.js";

function speakersList(state = { user: {} }, action) {
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
		default:
			return state;
	}
}

let store = createStore(
	speakersList,
	window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
