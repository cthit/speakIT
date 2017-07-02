import React, { Component } from "react";
import { toast } from "react-toastify";
import styled from "styled-components";

import { getJson, postJson, sendDelete } from "../fetch.js";

import {
  Container,
  Row,
  RowContent,
  SubmitButton
} from "../SharedComponents.js";

import List from "./List.js";

class ListsView extends Component {
  constructor(props) {
    super(props);

    this.statics = {
      notRegistered: "notRegistered",
      waiting: "waiting",
      registered: "registered"
    };

    this.state = {
      status: this.statics.notRegistered,
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

  registerTalkRequest = () => {
    console.log("raise hand");

    postJson("/list")
      .then(resp => {
        this.setState({ status: this.statics.registered });
      })
      .then(this.updateSpeakersList)
      .catch(err => {
        console.error("Could not register to the speakers list.", err);
      });
  };

  unregisterTalkRequest() {
    console.log("lower hand");
    this.setState({ status: this.statics.notRegistered });

    sendDelete("/list")
      .then(resp => {
        this.setState({ status: this.statics.notRegistered });
      })
      .then(this.updateSpeakersList)
      .catch(err => {
        console.error("Could not unregister from the speakers list.", err);
        toast.error(`Could not unregister from the speakers list: ${err}`);
      });
  }

  render() {
    let { status, speakerLists } = this.state;

    console.log(speakerLists);
    return (
      <ListViewContainer>
        <Row>
          <RowContent>
            <SubmitButton
              type="button"
              value={
                status === this.statics.registered
                  ? "Ta bort mig"
                  : "Lägg till mig"
              }
              onClick={
                status === this.statics.registered
                  ? () => this.unregisterTalkRequest()
                  : () => this.registerTalkRequest()
              }
            />
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
