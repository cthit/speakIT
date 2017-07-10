import React, { Component } from "react";
import { toast } from "react-toastify";
import FontAwesome from "react-fontawesome";
import styled from "styled-components";

import { postJson, sendDelete } from "./fetch.js";
import {
  ItemTitle,
  Container,
  SubContainer,
  Row,
  RowContent,
  Input,
  SubmitButton,
  Title
} from "./SharedComponents.js";

import { requestAdminLogin } from "./actions.js";

class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPassword: false,
      authCode: "",
      nickToRemove: ""
    };
  }

  newDiscussion() {
    postJson("/admin/discussion")
      .then(resp => {
        toast.success("Discussion added");
      })
      .catch(err => {
        toast.error(`Could not add discussion ${err}`);
      });
  }

  endDiscussion() {
    sendDelete("/admin/discussion")
      .then(resp => {
        toast.success("Discussion ended");
      })
      .catch(err => {
        toast.error(`Could not end discussion ${err}`);
      });
  }

  removeUser = () => {
    sendDelete("/admin/user", { nick: this.state.nickToRemove })
      .then(resp => {
        if (resp.status === 200) {
          toast.success(this.state.nickToRemove + "Removed from discussion");
        }
      })
      .catch(err => {
        toast.success(
          `Could not remove '${this.state.nickToRemove}' from discussion`
        );
      });
  };

  attemptAuth = () => {
    requestAdminLogin(this.state.authCode);
  };

  handleNickToRemoveChange = event => {
    this.setState({ nickToRemove: event.target.value });
  };

  handleAuthCodeChange = event => {
    this.setState({ authCode: event.target.value });
  };

  toggleShowPassword = () => {
    this.setState({ showPassword: !this.state.showPassword });
  };

  render() {
    const { user } = this.props;

    if (user.isAdmin) {
      return (
        <Container>
          <SubContainer>
            <LoggedIn>
              Du är inloggad.
            </LoggedIn>
          </SubContainer>
        </Container>
      );
    }

    return (
      <Container>
        <SubContainer>
          <Row>
            <Title>Authenticate</Title>
          </Row>
          <Row>
            <RowContent>
              <Input
                type={this.state.showPassword ? "text" : "password"}
                onKeyPress={this.handleKeyPress}
                value={this.state.authCode}
                onChange={this.handleAuthCodeChange}
              />
              <FontAwesome
                name={this.state.showPassword ? "eye-slash" : "eye"}
                style={{ cursor: "pointer" }}
                onClick={this.toggleShowPassword}
              />

            </RowContent>
          </Row>
          <Row>
            <RowContent>
              <SubmitButton
                type="button"
                value="Send"
                onClick={this.attemptAuth}
              />
            </RowContent>
          </Row>
        </SubContainer>
      </Container>
    );
  }
}

export default Admin;

const LoggedIn = styled(Row)`
  color: #7ed321;
  font-size: 36px;
  font-weight: bold;
  text-align: center;
`;
