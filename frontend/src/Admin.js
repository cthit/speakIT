import React, { Component } from "react";
import FontAwesome from "react-fontawesome";

import {
  ListContainer,
  ListHeader,
  ListTitle,
  SubListTitle,
  ListBody,
  HR,
  RowContainer,
  ColumnContainer,
  Container,
  SubContainer,
  Row,
  RowContent,
  Input,
  Title
} from "./SharedComponents.js";

import SubmitButton from "./SubmitButton.js";

import { requestAdminLogin } from "./actions.js";

class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPassword: false,
      authCode: ""
    };
  }

  attemptAuth = () => {
    requestAdminLogin(this.state.authCode);
  };

  handleAuthCodeChange = event => {
    this.setState({ authCode: event.target.value });
  };

  toggleShowPassword = () => {
    this.setState({ showPassword: !this.state.showPassword });
  };

  renderLoginPromp = () => {
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
                onPositiveClick={this.attemptAuth}
                positiveText="Logga in"
                isShowingPositive={true}
              />
            </RowContent>
          </Row>
        </SubContainer>
      </Container>
    );
  };

  renderUsers = (users, f) => {
    if (!f) {
      f = () => true;
    }
    console.log("helo       ", users);
    console.log("helo filter", users.filter(f));
    return (
      <div>
        {users.filter(f).map(u => <div>{u.nick}</div>)}
      </div>
    );
  };

  render() {
    const { user } = this.props;

    if (!user.isAdmin) {
      return this.renderLoginPromp();
    }

    const { users, adminCreatedUsers } = this.props;

    return (
      <RowContainer>

        <ColumnContainer>

          <ListContainer>
            <ListHeader>
              <ListTitle>
                Användare
              </ListTitle>
            </ListHeader>

            <ListBody>
              <SubListTitle>Aktiva</SubListTitle>
              <HR />
              {this.renderUsers(users, u => u.connected)}

              <SubListTitle>Inaktiva</SubListTitle>
              <HR />
              {this.renderUsers(users, u => !u.connected)}

              <SubListTitle>Skapade av admin</SubListTitle>
              <HR />
              {this.renderUsers(adminCreatedUsers)}

            </ListBody>

          </ListContainer>

        </ColumnContainer>

        <ColumnContainer>
          <ListContainer>
            <ListHeader>
              <ListTitle>
                Lösenord
              </ListTitle>
            </ListHeader>
          </ListContainer>
        </ColumnContainer>

      </RowContainer>
    );
  }
}

export default Admin;
