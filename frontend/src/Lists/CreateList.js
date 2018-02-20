import React, { Component } from "react";

import styled from "styled-components";
import FontAwesome from "react-fontawesome";
import ScrollArea from "react-scrollbar";

import SubmitButton from "../SubmitButton.js";
import AdminToolBar from "./AdminToolBar.js";
import AdminFooter from "./AdminFooter.js";

import { ListContainer, ListHeader } from "../SharedComponents.js";

import {
  requestCreateList,
  requestToggleCreateList,
  setListTitle
} from "../actions.js";

import { connect } from "react-redux";

class CreateList extends Component {
  createNewList = () => {
    this.props.toggleCreateList(true);
  };

  renderAdminTools = (debateIsOpen, listId) => {
    return <AdminToolBar />;
  };

  titleChange = event => {
    this.props.newListTitle(event.target.value);
  };

  createList = event => {
    event && event.preventDefault();
    this.props.onCreateList(this.props.discussionTitle);
  };

  render() {
    const { creatingNewList, discussionTitle } = this.props;

    if (!creatingNewList) {
      return (
        <ListContainerPlaceholder onClick={this.createNewList}>
          <BigFontAwesome name="plus-circle" />
        </ListContainerPlaceholder>
      );
    }

    return (
      <ListContainer>
        <ListHeader>
          <Form onSubmit={this.createList}>
            <DiscussionTitle
              placeholder="New discussion"
              onChange={this.titleChange}
              value={discussionTitle}
              autoFocus
            />
            <SubmitButton
              disabled={discussionTitle.length === 0}
              isShowingPositive={true}
              onPositiveClick={this.createList}
              positiveText="Create list"
            />
          </Form>
          <AdminToolBarPlaceholder
            debateIsOpen={true}
            toggleDiscussionStatus={() => {}}
          />
        </ListHeader>

        <Scroll speed={0.8} horizontal={false} minScrollSize={1}>
          <ListTitle>First speakers list (0)</ListTitle>

          <ListTitle>Second speakers list (0)</ListTitle>
        </Scroll>
        <AdminFooterPlaceholder />
      </ListContainer>
    );
  }
}

const mapStateToProps = state => ({
  creatingNewList: state.lists.creatingNewList,
  discussionTitle: state.lists.discussionTitle
});

const mapDispatchToProps = dispatch => ({
  onCreateList: title => dispatch(requestCreateList(title)),
  toggleCreateList: bool => dispatch(requestToggleCreateList(bool)),
  newListTitle: title => dispatch(setListTitle(title))
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateList);

const BigFontAwesome = styled(FontAwesome)`
    font-size: 128px;
    color: #7dbf34;
`;

const Scroll = styled(ScrollArea)`
	height: 20em;
	opacity: 0.2;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const ListContainerPlaceholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 20em;
  background-color: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
  min-height: 18em;
  opacity: 0.5;
  :hover {
    opacity: 0.8;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.8);
  }
  :active {
    opacity: 1.0;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 1.0);
  }
  cursor: pointer;
`;

const AdminToolBarPlaceholder = styled(AdminToolBar)`
	opacity: 0.2;
`;

const AdminFooterPlaceholder = styled(AdminFooter)`
	opacity: 0.2;
`;

const ListTitle = styled.div`
  font-family: Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;
  font-size: 1.25em;
  font-weight: bold;
  color: #4a4a4a;
  padding-top: 0.5em;
  padding-left: 1em;
`;

const DiscussionTitle = styled.input`
  font-family: Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;
  font-size: 2em;
  height: 2em;
  line-height: 2em;
  text-align: center;
  font-weight: bold;
  color: #4a4a4a;
`;
