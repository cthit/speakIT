import React, { Component } from "react";
import styled from "styled-components";
import FontAwesome from "react-fontawesome";

class AdminToolBar extends Component {
  render() {
    const {
      discussionIsOpen,
      setDiscussionStatus,
      onNextClick,
      onAddUser,
      className
    } = this.props;

    const debateBackground = discussionIsOpen
      ? {}
      : { backgroundColor: "#d8d8d8" };

    return (
      <ToolBar className={className}>
        <ToolBarItem onClick={onNextClick}>
          <Icon name="stack-overflow" size="2x" flip="horizontal" />
          <ItemText>Next speaker</ItemText>
        </ToolBarItem>
        <ToolBarItem
          style={debateBackground}
          onClick={() =>
            setDiscussionStatus(discussionIsOpen ? "closed" : "open")}
        >
          <Icon name="users" size="2x" />
          <ItemText>Call for a vote</ItemText>
        </ToolBarItem>
        <ToolBarItem onClick={onAddUser}>
          <Icon name="user-plus" size="2x" />
          <ItemText>Add person</ItemText>
        </ToolBarItem>
      </ToolBar>
    );
  }
}

const Icon = styled(FontAwesome)`
	flex: 1;
	margin-bottom: 0.2em;
`;

const ToolBar = styled.div`
	display: flex;
	border-bottom 1px solid #e5e5e5;
`;

const ToolBarItem = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;
  flex: 1;
  font-size: 0.8em;
  text-align: center;
  padding: 1.5em 0;
  line-height: 2em;
  color: #4990e2;
  background-color: #f5f5f5;
  :hover {
    background-color: #e5e5e5;
  }
  :active {
    background-color: #d5d5d5;
  }
`;

const ItemText = styled.div`
  line-height: 1em;
  flex: 1;
  margin-top: 0.2em;
`;

export default AdminToolBar;
