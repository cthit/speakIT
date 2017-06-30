import React, { Component } from "react";
import styled from "styled-components";

import { toast } from "react-toastify";

import { getJson, postJson } from "./fetch";

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
        <UserContainer>

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
        </UserContainer>
      </Container>
    );
  }
}

const ItemTitle = styled.div`
  width: 5rem;
  align-content: right;
  display: flex;
  justify-content: flex-end;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
`;

const UserContainer = styled.div`
  display: flex;
  justify-content: space-around;
  flex-direction: column;
  width: 600px;
  height: 287.6px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
`;

const Row = styled.div`
  display: flex;
  justify-content: space-around;
`;

const RowContent = styled.div`
  display: flex;
`;

const Input = styled.input`
  border: 0;
  outline: 0;
  background: transparent;
  border-bottom: 1px solid #4a4a4a;
  margin-left: 20px;
  width: 370px;
`;

const SubmitButton = styled.input`
  
  background-color: #7ed321;
  border: none;
  outline: none;
  padding: 15px 45px;
  :hover {
    background-color: #a4e063;
  }
  :active {
    background-color: #71bd1d;
  }
  :disabled {
    background-color: #c4c4c4; 
  }
`;

export default User;
