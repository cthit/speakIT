import { createStore } from "redux";
import { USER_UPDATE } from "./actions.js";

function speakersList(state = { user: {} }, action) {
	switch (action.type) {
		case USER_UPDATE:
			const { user } = action;
			return {
				...state,
				user
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
