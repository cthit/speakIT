import { USER_UPDATE, USERS_UPDATE, USER_GET_WAITING } from "../actions.js";

const initialState = {
  user: {},
  users: [],
  userGetWaiting: true
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case USER_UPDATE:
      const { user } = action;
      return {
        ...state,
        user,
        users: state.users.map(u => (u.id === user.id ? user : u)),
        userGetWaiting: false
      };

    case USERS_UPDATE:
      const { usersObj: { users, adminCreatedUsers } } = action;
      return {
        ...state,
        users,
        adminCreatedUsers: adminCreatedUsers || []
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
