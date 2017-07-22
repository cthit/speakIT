import { USER_UPDATE, USER_GET_WAITING } from "../actions.js";

const initialState = {
  user: {},
  userGetWaiting: true
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case USER_UPDATE:
      const { user } = action;
      return {
        ...state,
        user,
        userGetWaiting: false
      };
    case USER_GET_WAITING:
      return {
        ...state,
        userGetWaiting: true
      };

    default:
      return state;
  }
}
