import React, { Component } from "react";

import { toast } from "react-toastify";

import { getJson, postJson } from "./fetch";

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
      user: {},
      newNick: ""
    };
  }

  componentWillMount() {
    this.updateUser();
  }

  updateUser = user => {
    getJson("/me")
      .then(resp => {
        this.setState({
          user: resp,
          newNick: resp.nick
        });
      })
      .catch(err => {
        toast.error(`Could not get user: ${err.msg}`);
      });
  };

  handleChange = event => {
    this.setState({ newNick: event.target.value });
  };

  handleKeyPress = event => {
    if (event.key === "Enter") {
      const { user: { nick }, newNick } = this.state;
      if (nick !== newNick) {
        this.onSave(newNick);
      }
    }
  };

  onSave = newNick => {
    postJson("/me", { nick: newNick })
      .then(resp => {
        this.setState({ user: resp });
        toast.success("User updated.");
      })
      .catch(err =>
        toast.error(`Could not update nick, not connected to server: ${err}`)
      );
  };

  render() {
    const { user: { nick, id, isAdmin }, newNick } = this.state;

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
                onClick={() => this.onSave(newNick)}
              />
            </RowContent>
          </Row>
        </SubContainer>
      </Container>
    );
  }
}

export default User;
