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

class User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newNick: ""
    };
  }

  handleChange = event => {
    this.setState({ newNick: event.target.value });
  };

  handleKeyPress = event => {
    if (event.key === "Enter") {
      const { newNick } = this.state;
      const { user: { nick } } = this.props;
      if (nick !== newNick) {
        this.props.updateUser(newNick);
      }
    }
  };

  render() {
    const { newNick } = this.state;
    const { user: { nick, id, isAdmin }, updateUser } = this.props;

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
                onClick={() => updateUser(newNick)}
              />
            </RowContent>
          </Row>
        </SubContainer>
      </Container>
    );
  }
}

export default User;
