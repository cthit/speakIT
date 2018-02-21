import React, { Component } from "react";

import { Row } from "../SharedComponents.js";

import Loading from "../loading.js";

import List from "./List.js";
import CreateList from "./CreateList.js";
import Notes from "./Notes.js";

class ListsView extends Component {
  render() {
    const { user, lists, loading } = this.props;

    if (loading) {
      return <Loading />;
    }

    return (
      <MainContainer>
        <ListContainer numberOfLists={lists.length}>
          {lists.map((list, i) => (
            <List
              key={list.id}
              list={list}
              user={user}
              inactive={i < lists.length - 1}
            />
          ))}
        </ListContainer>
        {user.isAdmin && <CreateList />}
        <Notes />
      </MainContainer>
    );
  }
}

const ListContainer = Row.extend`
  margin-left: -${props => (props.numberOfLists - 2) * 20}em;
  align-self: ${props => (props.numberOfLists > 1 ? "flex-end" : "center")};
  width: ${props => props.numberOfLists * 20}em;
  margin-bottom: 2em;

  transition: ${props =>
    props.numberOfLists > 1 ? "all" : "margin-left"} 1000ms;
`;

const MainContainer = Row.extend`
  @media (min-width: 900px) {
    flex-direction: row;
    justify-content: space-around;
  }
  @media (max-width: 900px) {
    flex-direction: column;
    align-items: center;
  }
`;

export default ListsView;
