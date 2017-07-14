import React, { Component } from "react";

import styled from "styled-components";
import FontAwesome from "react-fontawesome";
import ScrollArea from "react-scrollbar";

import SubmitButton from "../SubmitButton.js";
import AdminToolBar from "./AdminToolBar.js";
import AdminFooter from "./AdminFooter.js";

import { ListContainer, ListHeader } from "../SharedComponents.js";

import store from "../store.js";
import { requestCreateList } from "../actions.js";

class CreateList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			creatingNewList: false
		};
	}

	createNewList = () => {
		console.log("new list");
		this.setState({
			creatingNewList: true
		});
	};

	renderAdminTools = (debateIsOpen, listId) => {
		return <AdminToolBar />;
	};

	titleChange = event => {
		this.setState({
			discussionTitle: event.target.value
		});
	};

	createList = () => {
		const { discussionTitle } = this.state;
		store.dispatch(requestCreateList(discussionTitle));
		this.setState({
			creatingNewList: false,
			discussionTitle: ""
		});
	};

	render() {
		const { creatingNewList, discussionTitle } = this.state;

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
					<DiscussionTitle
						placeholder="Ny diskussion"
						onChange={this.titleChange}
						value={discussionTitle}
						autoFocus
					/>
					<SubmitButton
						isShowingPositive={true}
						onPositiveClick={this.createList}
						positiveText="Skapa lista"
					/>
					<AdminToolBarPlaceholder
						debateIsOpen={true}
						toggleDiscussionStatus={() => {}}
					/>
				</ListHeader>

				<Scroll speed={0.8} horizontal={false} minScrollSize={1}>
					<ListTitle>Första talarlista (0)</ListTitle>

					<ListTitle>Andra talarlista (0)</ListTitle>
				</Scroll>
				<AdminFooterPlaceholder />
			</ListContainer>
		);
	}
}

const BigFontAwesome = styled(FontAwesome)`
    font-size: 128px;
    color: #7dbf34;
`;

const Scroll = styled(ScrollArea)`
	height: 20em;
	opacity: 0.2;
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
		opacity: 0.7;
	}
	:active {
		opacity: 0.9;
	}
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

export default CreateList;
