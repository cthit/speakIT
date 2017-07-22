import {
  LISTS_UPDATE,
  LISTS_GET_WAITING,
  LIST_WAITING,
  LIST_UPDATE,
  LIST_OPEN,
  LIST_CREATE,
  LIST_TITLE
} from "../actions.js";

const initialState = {
  listsGetWaiting: true,
  lists: [],
  creatingNewList: false,
  discussionTitle: ""
};

export default function listReducer(state = initialState, action) {
  switch (action.type) {
    case LISTS_UPDATE:
      return {
        ...state,
        lists: action.lists.map(l => ({
          ...l,
          updating: false
        })),
        listsGetWaiting: false
      };

    case LIST_UPDATE:
      return {
        ...state,
        lists: state.lists.map(l => {
          if (l.id === action.list.id) {
            return {
              ...action.list,
              updating: false
            };
          } else {
            return l;
          }
        })
      };

    case LISTS_GET_WAITING:
      return {
        ...state,
        listsGetWaiting: true
      };

    case LIST_WAITING:
      return {
        ...state,
        lists: state.lists.map(l => {
          if (l.id === action.id) {
            return {
              ...l,
              updating: true
            };
          } else {
            return l;
          }
        })
      };

    case LIST_OPEN:
      return {
        ...state,
        creatingNewList: action.bool
      };
    case LIST_CREATE:
      return {
        ...state,
        creatingNewList: false,
        discussionTitle: ""
      };
    case LIST_TITLE:
      return {
        ...state,
        discussionTitle: action.title
      };

    default:
      return state;
  }
}
