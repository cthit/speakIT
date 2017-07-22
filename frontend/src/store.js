import { compose, createStore, combineReducers } from "redux";

import throttle from "lodash/throttle";

import { loadState, saveState } from "./localStorage.js";
import UserReducer from "./reducers/User";
import NotesReducer from "./reducers/Notes";
import ListsReducer from "./reducers/Lists";

const persistedState = loadState();

const mainReducer = combineReducers({
  user: UserReducer,
  notes: NotesReducer,
  lists: ListsReducer
});

const enhancers = compose(
  window.__REDUX_DEVTOOLS_EXTENSION__
    ? window.__REDUX_DEVTOOLS_EXTENSION__()
    : f => f
);

let store = createStore(mainReducer, persistedState, enhancers);

store.subscribe(
  throttle(() => {
    saveState(store.getState());
  }, 1000)
);

export default store;
