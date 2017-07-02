import React, { Component } from "react";
import styled from "styled-components";

import { getJson } from "../fetch.js";

import { Container, Row, RowContent } from "../SharedComponents.js";

import List from "./List.js";

class ListsView extends Component {
  constructor(props) {
    super(props);

    this.state = {
      speakerLists: []
    };
  }

  updateSpeakersList = () => {
    console.log("Updating speakers list");
    getJson("/list").then(resp => {
      const activeList = resp[resp.length - 1];
      console.log(activeList);

      this.setState({ speakerLists: resp });
    });
  };

  componentDidMount() {
    this.updateSpeakersList();
  }

  render() {
    let { speakerLists } = this.state;

    console.log(speakerLists);
    return (
      <ListViewContainer>
        <Row>
          <RowContent>
            Du är: Tejp
          </RowContent>
        </Row>

        <ListsContainer>
          {speakerLists.map(list => <List key={list.id} list={list} />)}
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
