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

        <MainContainer>
          <ListContainer width={(lists.length - 2) * 20}>
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
  margin-left: -${props => props.width}em;
`;

const MainContainer = styled(Row)`
  padding-top: 2em;
`;

export default ListsView;
