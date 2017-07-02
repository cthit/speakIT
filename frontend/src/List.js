import React, { Component } from "react";
import { toast } from "react-toastify";
import styled from "styled-components";
import FontAwesome from "react-fontawesome";

import { getJson, postJson, sendDelete } from "./fetch.js";

import {
  Container,
  Row,
  RowContent,
  SubmitButton
} from "./SharedComponents.js";

const createSpeakerRow = (user, index) => {
  return (
    <SpeakerRow>
      {index === 0
        ? <CurrentSpeakerArrow name="angle-right" />
        : <PlaceHolder name="angle-right" />}
      <Speaker key={user.id}>{user.nick}</Speaker>
    </SpeakerRow>
  );
};

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

          <Lists>
            <ListsContainer>
              {speakerLists.map(list => {
                return (
                  <ListContainer key={list.id}>
                    <ListHeader>
                      <DiscussionTitle>{list.title}</DiscussionTitle>
                    </ListHeader>
                    <ListTitle>Första talarlista</ListTitle>
                    {list.speakersQueue
                      .map((user, index) => createSpeakerRow(user, index))
                      .reduce(
                        (acc, item, i) =>
                          acc.concat(i === 0 ? [item] : [<HR />, item]),
                        []
                      )}

                    <ListTitle>Andra talarlista</ListTitle>
                    {list.speakersQueue
                      .map((user, index) => createSpeakerRow(user, index))
                      .reduce(
                        (acc, item, i) =>
                          acc.concat(i === 0 ? [item] : [<HR />, item]),
                        []
                      )}
                  </ListContainer>
                );
              })}
            </ListsContainer>
          </Lists>

        </SubContainer>

      </Container>
    );
  }
}

const HR = styled.hr`
  width: 18em;
  border: none;
  border-top: 1px solid #979797;
`;

const Lists = styled(Row)`
  padding-top: 2em;
`;

const ListHeader = styled.div`
  height: 98px;
  border: solid 1px #979797;
  background-color: #efeeee;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const DiscussionTitle = styled.div`
  font-family: Helvetica Neue,Helvetica,Roboto,Arial,sans-serif;
  font-size: 2em;
  font-weight: bold;
  color: #4a4a4a;
`;

const ListTitle = styled.div`
  font-family: Helvetica Neue,Helvetica,Roboto,Arial,sans-serif;
  font-size: 1.25em;
  font-weight: bold;
  color: #4a4a4a;
  padding-top: 0.5em;
  padding-left: 1em;
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
  width: 20em;
  background-color: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
`;

const Speaker = styled.div`
  font-size: 1.5em;
  padding: 1em 0;
`;

const SpeakerRow = styled.div`
  display: flex;
`;

const CurrentSpeakerArrow = styled(FontAwesome)`
  color: green;
  padding 1em;
  padding-left: 1.5em;
  font-size: 1.5em;
`;

const PlaceHolder = styled(CurrentSpeakerArrow)`
  opacity: 0;
`;

export default List;
