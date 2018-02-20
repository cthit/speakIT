import { ADMIN_UPDATE_PASSWORD_LIST, ADMIN_PASSWORD_WAITING } from "../actions.js";

const initialState = {
    passwords: [],
    passwordListGetWaiting: true
};

export default function userReducer(state = initialState, action) {
    switch (action.type) {
    case ADMIN_UPDATE_PASSWORD_LIST:
        const { passwords } = action.passwords;
        return {
            ...state,
            passwords,
            passwordListGetWaiting: false
        };
        
        
    case ADMIN_PASSWORD_WAITING:
        return {
            ...state,
            passwordListGetWaiting: true
        };

    default:
      return state;
  }
}
