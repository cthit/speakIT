import React, { Component } from "react";

import styled from "styled-components";
import FontAwesome from "react-fontawesome";
import ScrollArea from "react-scrollbar";

import SubmitButton from "../SubmitButton.js";
import AdminToolBar from "./AdminToolBar.js";
import AdminFooter from "./AdminFooter.js";

import store from "../store.js";
import {
	requestAddUserToList,
	requestRemoveUserFromList,
	requestDeleteList,
	requestPopList,
	requestSetDiscussionStatus
} from "../actions.js";

const createSpeakerRow = (user, index) => {
	return (
		<SpeakerRow key={user.id}>
			{index === 0
				? <CurrentSpeakerArrow name="angle-right" />
				: <PlaceHolder name="angle-right" />}
			<Speaker key={user.id}>
				{user.nick}
			</Speaker>
		</SpeakerRow>
	);
};

class List extends Component {
	registerTalkRequest = () => {
		store.dispatch(requestAddUserToList(this.props.list.id));
	};

	unregisterTalkRequest = () => {
		store.dispatch(requestRemoveUserFromList(this.props.list.id));
	};

	setDiscussionStatus = status => {
		store.dispatch(requestSetDiscussionStatus(this.props.list.id, status));
	};

	deleteList = () => {
		const { list: { id } } = this.props;
		store.dispatch(requestDeleteList(id));
	};

	nextSpeaker = () => {
		store.dispatch(requestPopList(this.props.list.id));
	};

	renderAdminTools = (discussionIsOpen, listId) => {
		return (
			<AdminToolBar
				discussionIsOpen={discussionIsOpen}
				setDiscussionStatus={this.setDiscussionStatus}
				listId={listId}
				onNextClick={this.nextSpeaker}
			/>
		);
	};

	renderAdminFooter = listId => {
		return <AdminFooter onClick={this.deleteList} />;
	};

	render() {
		const { list, user } = this.props;

		const userIsPresent = list.speakersQueue
			.concat(list.secondSpeakersQueue)
			.some(u => u.id === user.id);

		return (
			<ListContainer key={list.id}>
				<ListHeader>
					<DiscussionTitle>
						{list.title}
					</DiscussionTitle>
					{list.status === "open" || user.isAdmin
						? <SubmitButton
								disabled={list.updating}
								isShowingPositive={!userIsPresent}
								onNegativeClick={this.unregisterTalkRequest}
								onPositiveClick={this.registerTalkRequest}
								positiveText="Skriv upp mig"
								negativeText="Stryk mig"
							/>
						: <DiscussionClosedLabel>
								Streck i debatten
							</DiscussionClosedLabel>}
					{user.isAdmin &&
						this.renderAdminTools(list.status === "open", list.id)}
				</ListHeader>

				<Scroll speed={0.8} horizontal={false} minScrollSize={1}>
					<ListTitle>
						Första talarlista ({list.speakersQueue.length})
					</ListTitle>
					{list.speakersQueue
						.map((user, index) => createSpeakerRow(user, index))
						.reduce(
							(acc, item, i) =>
								acc.concat(
									i === 0 ? [item] : [<HR key={i} />, item]
								),
							[]
						)}

					<ListTitle>
						Andra talarlista ({list.secondSpeakersQueue.length})
					</ListTitle>
					{list.secondSpeakersQueue
						.map((user, index) => createSpeakerRow(user, index))
						.reduce(
							(acc, item, i) =>
								acc.concat(
									i === 0 ? [item] : [<HR key={i} />, item]
								),
							[]
						)}
				</Scroll>
				{user.isAdmin && this.renderAdminFooter(list.Id)}
			</ListContainer>
		);
	}
}

const DiscussionClosedLabel = styled.div`
	background-color: #e80808;
	color: white;
	border: none;
	outline: none;
	padding: 15px 45px;
	font-size: 1.1em;
	text-align: center;
`;

const Scroll = styled(ScrollArea)`
	height: 20em;
`;

const ListContainer = styled.div`
	display: flex;
	justify-content: space-between;
	flex-direction: column;
	width: 20em;
	background-color: #ffffff;
	box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
	min-height: 18em;
`;

const ListHeader = styled.div`
	background-color: #efeeee;
	display: flex;
	flex-direction: column;
`;

const ListTitle = styled.div`
	font-family: Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;
	font-size: 1.25em;
	font-weight: bold;
	color: #4a4a4a;
	padding-top: 0.5em;
	padding-left: 1em;
`;

const DiscussionTitle = styled.div`
	font-family: Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;
	font-size: 2em;
	height: 2em;
	line-height: 2em;
	text-align: center;
	font-weight: bold;
	color: #4a4a4a;
`;

const Speaker = styled.div`
	font-size: 1.5em;
	padding: 1em 0;
`;

const SpeakerRow = styled.div`display: flex;`;

const CurrentSpeakerArrow = styled(FontAwesome)`
  color: green;
  padding 1em;
  padding-left: 1.5em;
  font-size: 1.5em;
`;

const PlaceHolder = styled(CurrentSpeakerArrow)`
  opacity: 0;
`;

const HR = styled.hr`
	width: 18em;
	border: none;
	border-top: 1px solid #979797;
`;

export default List;
