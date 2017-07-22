import React, { Component } from "react";
import styled from "styled-components";

import { Container, Row, RowContent } from "../SharedComponents.js";

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
      <ListViewContainer>
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
      </ListViewContainer>
    );
  }
}

const ListViewContainer = styled(Container)`
  flex-direction: column;
`;

const ListsContainer = styled(Row)`
  padding-top: 2em;
`;

export default ListsView;
