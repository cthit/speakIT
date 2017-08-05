import React, { Component } from "react";
import styled from "styled-components";

import { Row, RowContent, ColumnContainer } from "../SharedComponents.js";

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
        <Row>
          <RowContent>
            Du är: {user.nick}
          </RowContent>
        </Row>

        <ListsContainer>
          {lists.map(list => <List key={list.id} list={list} user={user} />)}
          <Notes />
          {user.isAdmin && <CreateList />}
        </ListsContainer>
      </ColumnContainer>
    );
  }
}

const ListsContainer = styled(Row)`
  padding-top: 2em;
`;

export default ListsView;
