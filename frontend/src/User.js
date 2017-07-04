import React, { Component } from "react";

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
        requestUserUpdate({ ...user, nick: newNick });
      }
    }
  };

  render() {
    if (!this.props.user) {
      return <div>nope</div>;
    }

    const { newNick } = this.state;
    const { user, user: { nick, id, isAdmin } } = this.props;

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
