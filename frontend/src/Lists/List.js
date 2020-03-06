import React, { Component } from "react";

import styled from "styled-components";
import FontAwesome from "react-fontawesome";

import SubmitButton from "../SubmitButton.js";
import AdminToolBar from "./AdminToolBar.js";
import AdminFooter from "./AdminFooter.js";

import {
  ListContainer,
  ListHeader,
  ListTitle,
  SubListTitle,
  HR
} from "../SharedComponents.js";

import store from "../store.js";
import {
  requestAddUserToList,
  requestRemoveUserFromList,
  requestDeleteList,
  requestPopList,
  requestSetDiscussionStatus,
  requestListAdminAddUser
} from "../actions.js";
import RemoveUserButton from "./RemoveUserButton.js";

const createSpeakerRow = (user, index, isAdmin) => {
  return (
    <SpeakerRow key={user.id}>
      {index === 0 ? (
        <CurrentSpeakerArrow name="angle-right" />
      ) : (
        <PlaceHolder name="angle-right" />
      )}
      <Speaker key={user.id}>{user.nick}</Speaker>
      {isAdmin ? <RemoveUserButton /> : <PlaceHolder name="trash" />}
    </SpeakerRow>
  );
};

class List extends Component {
  constructor(props) {
    super(props);
    this.state = {
      adminAdduser: false,
      adminAddUserNick: ""
    };
  }

  registerTalkRequest = () => {
    store.dispatch(requestAddUserToList(this.props.list.id));
  };

  unregisterTalkRequest = () => {
    store.dispatch(requestRemoveUserFromList(this.props.list.id));
  };

  setDiscussionStatus = status => {
    if (this.props.inactive) {
      return;
    }

    store.dispatch(requestSetDiscussionStatus(this.props.list.id, status));
  };

  deleteList = () => {
    if (this.props.inactive) {
      return;
    }

    const {
      list: { id }
    } = this.props;
    store.dispatch(requestDeleteList(id));
  };

  nextSpeaker = () => {
    if (this.props.inactive) {
      return;
    }

    store.dispatch(requestPopList(this.props.list.id));
  };

  adminAddUserToggle = () => {
    if (this.props.inactive) {
      return;
    }

    this.setState({
      adminAddingUser: !this.state.adminAddingUser
    });
  };

  renderAdminTools = (discussionIsOpen, listId, inactive) => {
    return (
      <AdminToolBar
        discussionIsOpen={discussionIsOpen}
        setDiscussionStatus={this.setDiscussionStatus}
        listId={listId}
        onNextClick={this.nextSpeaker}
        onAddUser={this.adminAddUserToggle}
        inactive={inactive}
      />
    );
  };

  renderAdminAddUserInputBox = () => {
    const { adminAddUserNick } = this.state;
    return (
      <AdminAddUserContainer>
        Nick:
        <AdminUserNickInput
          type="text"
          value={adminAddUserNick}
          onChange={this.adminAddingUserInputChange}
          onKeyPress={this.onAdminAddingUserKeyPress}
          autoFocus
        />
        <AdminAddUserButton
          disabled={adminAddUserNick === ""}
          onClick={this.adminAddUser}
        />
      </AdminAddUserContainer>
    );
  };

  adminAddingUserInputChange = e => {
    this.setState({
      adminAddUserNick: e.target.value
    });
  };

  onAdminAddingUserKeyPress = e => {
    if (e.key === "Enter") {
      this.adminAddUser();
    }
  };

  adminAddUser = () => {
    if (this.props.inactive) {
      return;
    }

    const { adminAddUserNick } = this.state;
    const {
      list: { id }
    } = this.props;
    if (adminAddUserNick === "") {
      return;
    }

    this.setState({
      adminAddingUser: false,
      adminAddUserNick: ""
    });
    store.dispatch(requestListAdminAddUser(id, adminAddUserNick));
  };

  renderAdminFooter = (listId, inactive) => {
    return <AdminFooter onClick={this.deleteList} inactive={inactive} />;
  };

  render() {
    const { adminAddingUser } = this.state;
    const { list, user, inactive } = this.props;

    const userIsPresent = list.speakersQueue
      .concat(list.secondSpeakersQueue)
      .some(u => u.id === user.id);

    return (
      <ListContainer key={list.id} inactive={inactive}>
        <ListHeader>
          <ListTitle>{list.title}</ListTitle>
          {list.status === "open" || user.isAdmin ? (
            <SubmitButton
              disabled={list.updating || inactive}
              isShowingPositive={!userIsPresent}
              onNegativeClick={this.unregisterTalkRequest}
              onPositiveClick={this.registerTalkRequest}
              positiveText="Add me"
              negativeText="Remove me"
            />
          ) : (
            <DiscussionClosedLabel>Debate closed</DiscussionClosedLabel>
          )}
          {user.isAdmin &&
            this.renderAdminTools(list.status === "open", list.id, inactive)}
        </ListHeader>

        {adminAddingUser && this.renderAdminAddUserInputBox()}

        <SpeakersArea>
          <SubListTitle>
            First speakers list ({list.speakersQueue.length})
          </SubListTitle>
          {list.speakersQueue
            .map((aSpeaker, index) =>
              createSpeakerRow(aSpeaker, index, user.isAdmin)
            )
            .reduce(
              (acc, item, i) =>
                acc.concat(i === 0 ? [item] : [<HR key={i} />, item]),
              []
            )}

          <SubListTitle>
            Second speakers list ({list.secondSpeakersQueue.length})
          </SubListTitle>
          {list.secondSpeakersQueue
            .map((aSpeaker, index) =>
              createSpeakerRow(aSpeaker, index, user.isAdmin)
            )
            .reduce(
              (acc, item, i) =>
                acc.concat(i === 0 ? [item] : [<HR key={i} />, item]),
              []
            )}
        </SpeakersArea>
        {user.isAdmin && this.renderAdminFooter(list.Id, inactive)}
      </ListContainer>
    );
  }
}

const AdminAddUserButton = props => {
  return (
    <AdminAddUserButtonStyle {...props}>
      <FontAwesome name="user-plus" />
    </AdminAddUserButtonStyle>
  );
};

const AdminAddUserButtonStyle = styled.button`
  border: none;
  outline: none;
  background-color: transparent;
  cursor: pointer;
  color: #84c043;
  font-size: 1.5em;
  :hover {
    color: #a4e063;
  }
  :active {
    color: #94d053;
  }
  :disabled {
    color: #aeaeae;
    cursor: default;
  }
`;

const AdminAddUserContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 1em;
  background-color: #efeeee;
  font-size: 1em;
`;

const AdminUserNickInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  font-size: 1em;
  margin: 0 1em;
  background-color: #efeeee;
  border-bottom: 1px solid black;
`;

const DiscussionClosedLabel = styled.div`
  background-color: #f4512e;
  color: white;
  border: none;
  outline: none;
  padding: 15px 45px;
  font-size: 1.1em;
  text-align: center;
`;

const SpeakersArea = styled.div`
  flex: 1;
  min-height: 20em;
  margin-bottom: 1em;
`;

const Speaker = styled.div`
  font-size: 1em;
  padding: 0.5em 0;
`;

const SpeakerRow = styled.div`
  display: flex;
  align-items: center;
`;

const CurrentSpeakerArrow = styled(FontAwesome)`
  color: green;
  padding 0.2em;
  padding-left: 1.5em;
  font-size: 1.5em;
`;

const PlaceHolder = styled(CurrentSpeakerArrow)`
  opacity: 0;
`;

export default List;
