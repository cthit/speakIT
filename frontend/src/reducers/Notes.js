import { NOTES_EDIT } from "../actions.js";

const initialState = {
  text: "",
  lastSaved: null
};

export default function notesReducer(state = initialState, action) {
  switch (action.type) {
    case NOTES_EDIT:
      const { value, lastSaved } = action;
      return {
        ...state,
        text: value,
        lastSaved
      };
    default:
      return state;
  }
}
