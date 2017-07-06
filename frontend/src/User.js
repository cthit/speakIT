import React, { Component } from "react";
import ReactLoading from "react-loading";

import {
  ItemTitle,
  Container,
  SubContainer,
  Row,
  RowContent,
  Input,
  SubmitButton
} from "./SharedComponents.js";

import { requestUserUpdate } from "./actions.js";
import store from "./store.js";

class User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newNick: props.user.nick || ""
    };
  }

  handleChange = event => {
    this.setState({ newNick: event.target.value });
  };

  handleKeyPress = event => {
    if (event.key === "Enter") {
      const { newNick } = this.state;
      const { user, user: { nick } } = this.props;
      if (nick !== newNick) {
        store.dispatch(requestUserUpdate({ ...user, nick: newNick }));
      }
    }
  };

  render() {
    const { newNick } = this.state;
    const { loading, user, user: { nick, id, isAdmin } } = this.props;

    if (loading) {
      return (
        <Container>
          <SubContainer>
            <Row>
              <ReactLoading type="spinningBubbles" color="#c4c4c4" />
            </Row>
          </SubContainer>
        </Container>
      );
    }

    return (
      <Container>
        <SubContainer>
          <Row>
            <RowContent>
              <ItemTitle>User:</ItemTitle>
              <Input
                type="text"
                onChange={this.handleChange}
                onKeyPress={this.handleKeyPress}
                value={newNick}
              />
            </RowContent>
          </Row>
          <Row>
            <RowContent>
              <ItemTitle>Id:</ItemTitle>
              <Input type="text" disabled value={id} />
            </RowContent>
          </Row>
          <Row>
            <RowContent>
              <ItemTitle>Is Admin:</ItemTitle>
              <Input type="text" disabled value={isAdmin} />
            </RowContent>
          </Row>
          <Row>
            <RowContent>
              <SubmitButton
                type="button"
                value="Spara"
                disabled={nick === newNick ? "disabled" : ""}
                onClick={() => requestUserUpdate({ ...user, nick: newNick })}
              />
            </RowContent>
          </Row>
        </SubContainer>
      </Container>
    );
  }
}

export default User;
