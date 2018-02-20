import React, { Component } from "react";

import {
  ItemTitle,
  Container,
  SubContainer,
  Row,
  RowContent,
  Input,
  ListHeader,
  ListTitle,
} from "./SharedComponents.js";

import SubmitButton from "./SubmitButton.js";

import Loading from "./loading.js";

import { requestUserUpdate } from "./actions.js";
import store from "./store.js";

class User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newNick: null
    };
  }

  handleChange = event => {
    this.setState({ newNick: event.target.value });
  };

  handleKeyPress = event => {
    if (event.key === "Enter") {
      this.dispatchUserUpdate();
    }
  };

  componentWillReceiveProps = nextProps => {
    this.setState({
      newNick: null
    });
  };

  dispatchUserUpdate = () => {
    const { newNick } = this.state;
    const { user } = this.props;
    if (this.validNick(newNick)) {
      store.dispatch(requestUserUpdate({ ...user, nick: newNick }));
    }
  };

  validNick = nick =>
    nick !== null && nick !== "" && nick !== this.props.user.nick;

  render() {
    const { newNick } = this.state;
    const { loading, user: { nick, id, isAdmin } } = this.props;

    if (loading) {
      return <Loading />;
    }

    return (
      <Container>
        <SubContainer>
        <ListHeader>
          <ListTitle>
            User settings
          </ListTitle>
        </ListHeader>
          <Row>
            <RowContent>
              <ItemTitle>Nick:</ItemTitle>
              <Input
                type="text"
                onChange={this.handleChange}
                onKeyPress={this.handleKeyPress}
                value={newNick == null ? nick : newNick}
              />
            </RowContent>
          </Row>
          <Row>
            {isAdmin &&
              <RowContent>
                <ItemTitle>Id:</ItemTitle>
                <Input type="text" disabled value={id} />
              </RowContent>
            }
          </Row>
          <Row>
            {isAdmin &&
              <RowContent>
                <ItemTitle>Is Admin:</ItemTitle>
                <Input type="text" disabled value={isAdmin} />
              </RowContent>
            }
          </Row>
          <Row>
            <RowContent>
              <SubmitButton
                positiveText="Spara"
                isShowingPositive={true}
                type="button"
                value="Spara"
                disabled={this.validNick(newNick) ? "" : "disabled"}
                onPositiveClick={this.dispatchUserUpdate}
              />
            </RowContent>
          </Row>
        </SubContainer>
      </Container>
    );
  }
}

export default User;
