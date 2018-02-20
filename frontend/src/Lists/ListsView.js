import React, { Component } from "react";

import { Row, ColumnContainer } from "../SharedComponents.js";

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
      <ColumnContainer>
        <MainContainer>
          <ListContainer numberOfLists={lists.length} >
            {lists.map((list, i) => <List key={list.id} list={list} user={user} inactive={i < lists.length - 1} />)}
          </ListContainer>
          {user.isAdmin && <CreateList />}
          <Notes />
        </MainContainer>
      </ColumnContainer>
    );
  }
}

const ListContainer = Row.extend`
  margin-left: -${props => (props.numberOfLists - 2) * 20}em;
  align-self: ${props => (props.numberOfLists > 1) ? 'flex-end' : 'center'};
  margin-bottom: 2em;
`;

const MainContainer = Row.extend`
  @media (min-width: 900px) {
    flex-direction: row;
  }
  @media (max-width: 900px) {
    flex-direction: column;
    align-items: center;
  }
`;

export default ListsView;
