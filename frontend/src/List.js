import React, { Component } from "react";
import { toast } from "react-toastify";
import styled from "styled-components";
import "whatwg-fetch";

import { getJson, postJson, sendDelete } from "./fetch.js";

import {
  Container,
  Title,
  Row,
  RowContent,
  SubmitButton
} from "./SharedComponents.js";

class List extends Component {
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
    console.log(status);
    return (
      <Container>
        <SubContainer>
          <Row>
            <RowContent>
              <SubmitButton
                type="button"
                value={
                  status === this.statics.notRegistered
                    ? "I want to talk"
                    : "I don't want to talk"
                }
                onClick={
                  status === this.statics.notRegistered
                    ? () => this.registerTalkRequest()
                    : () => this.unregisterTalkRequest()
                }
              />
            </RowContent>
          </Row>
          <ListsContainer>
            {speakerLists.map(list => {
              return (
                <ListContainer key={list.id}>
                  <ListHeader>
                    <ListTitle>{list.title}</ListTitle>
                  </ListHeader>
                  <Title>First speaker list</Title>
                  {list.speakersQueue.map(user => {
                    return <Speaker key={user.id}>{user.nick}</Speaker>;
                  })}
                  <Title>Second speaker list</Title>
                  {list.speakersQueue.map(user => {
                    return <Speaker key={user.id}>{user.nick}</Speaker>;
                  })}
                </ListContainer>
              );
            })}
          </ListsContainer>
        </SubContainer>
      </Container>
    );
  }
}

const ListHeader = styled.div`
  height: 98px;
  border: solid 1px #979797;
  background-color: #efeeee;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const ListTitle = styled.div`
  font-family: Helvetica Neue,Helvetica,Roboto,Arial,sans-serif;
  font-size: 2rem;
  font-weight: bold;
  color: #4a4a4a;
  background-color: #efeeee;
`;

const SubContainer = styled.div`
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  width: 600px;
`;

const ListsContainer = styled.div`
  display: flex;
  justify-content: space-around;
`;

const ListContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  width: 300px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
`;

const Speaker = styled.div`
  font-size: 2rem;
  margin-left: 68px;
`;

export default List;
