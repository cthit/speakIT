import React, { Component } from "react";
import { connect } from "react-redux";

import {
  ActionIconPositive,
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
} from "../SharedComponents.js";

import SubmitButton from "../SubmitButton.js";
import UserRow from "./UserRow.js";
import { requestAdminLogin, requestAdminGeneratePassword } from "../actions.js";

import store from "../store.js";

class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPassword: false,
      authCode: "",
      editingUser: null
    };
  }

  attemptAuth = () => {
    store.dispatch(requestAdminLogin(this.state.authCode));
  };

  requestNewPassword = () => {
    store.dispatch(requestAdminGeneratePassword());
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
            <Input
              type={this.state.showPassword ? "text" : "password"}
              onKeyPress={this.handleKeyPress}
              value={this.state.authCode}
              onChange={this.handleAuthCodeChange}
            />
            <ActionIconPositive
              name={this.state.showPassword ? "eye-slash" : "eye"}
              style={{ cursor: "pointer" }}
              onClick={this.toggleShowPassword}
            />
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
    return (
      <div>
        {users
          .filter(f)
          .map(u =>
            <UserRow
              key={u.id}
              user={u}
              removeEnabled={users.filter(user => user.isAdmin).length > 1}
            />
          )}
      </div>
    );
  };

  render() {
    const { user } = this.props;

    if (!user.isAdmin) {
      return this.renderLoginPromp();
    }

    const { users, adminCreatedUsers, passwords } = this.props;
    return (
      <RowContainer>
        <ColumnContainer>
          <ListContainer>
            <ListHeader>
              <ListTitle>
                Users
              </ListTitle>
            </ListHeader>

            <ListBody>
              <SubListTitle>Active</SubListTitle>
              <HR />
              {this.renderUsers(users, u => u.connected)}

              <SubListTitle>Inactive</SubListTitle>
              <HR />
              {this.renderUsers(users, u => !u.connected)}

              <SubListTitle>Created by admin</SubListTitle>
              <HR />
              {this.renderUsers(adminCreatedUsers)}

            </ListBody>

          </ListContainer>

        </ColumnContainer>

        <ColumnContainer>
          <ListContainer>
            <ListHeader>
              <ListTitle>
                Passwords
              </ListTitle>
            </ListHeader>
            <SubmitButton
              type="button"
              value="Send"
              onPositiveClick={this.requestNewPassword}
              positiveText="Create password"
              isShowingPositive={true}
            />

            {passwords.map(x => <Row key={x}> {x} </Row>)}
          </ListContainer>
        </ColumnContainer>

      </RowContainer>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user.user,
  users: state.user.users,
  adminCreatedUsers: state.user.adminCreatedUsers,
  passwords: state.password.passwords
});

//const mapDispatchToProps = dispatch => ({
//  onChangeNotes: newNotes => dispatch(notesEdit(newNotes))
//});

export default connect(mapStateToProps)(Admin);
