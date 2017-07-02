import React, { Component } from "react";

import styled from "styled-components";
import FontAwesome from "react-fontawesome";
import { toast } from "react-toastify";

import SubmitButton from "./SubmitButton.js";
import { postJson, sendDelete } from "../fetch.js";
import AdminToolBar from "./AdminToolBar.js";

const createSpeakerRow = (user, index) => {
	return (
		<SpeakerRow key={user.id}>
			{index === 0
				? <CurrentSpeakerArrow name="angle-right" />
				: <PlaceHolder name="angle-right" />}
			<Speaker key={user.id}>{user.nick}</Speaker>
		</SpeakerRow>
	);
};

class List extends Component {
	constructor(props) {
		super(props);

		this.statics = {
			notRegistered: "notRegistered",
			waiting: "waiting",
			registered: "registered"
		};

		this.state = {
			status: this.statics.notRegistered
		};
	}

	registerTalkRequest = () => {
		console.log("raise hand");

		postJson("/list")
			.then(resp => {
				this.setState({ status: this.statics.registered });
			})
			.then(this.updateSpeakersList)
			.catch(err => {
				console.error("Could not register to the speakers list.", err);
			});
	};

	unregisterTalkRequest() {
		console.log("lower hand");
		this.setState({ status: this.statics.notRegistered });

		sendDelete("/list")
			.then(resp => {
				this.setState({ status: this.statics.notRegistered });
			})
			.then(this.updateSpeakersList)
			.catch(err => {
				console.error(
					"Could not unregister from the speakers list.",
					err
				);
				toast.error(
					`Could not unregister from the speakers list: ${err}`
				);
			});
	}

	toggleDiscussionStatus = listId => {
		console.log("helo", listId);
		// TODO discussion status is not supported in the backend yet.
	};

	renderAdminTools = (debateIsOpen, listId) => {
		return (
			<AdminToolBar
				debateIsOpen={debateIsOpen}
				toggleDiscussionStatus={this.toggleDiscussionStatus}
				listId={listId}
			/>
		);
	};

	render() {
		const { list, status, user } = this.props;

		return (
			<ListContainer key={list.id}>
				<ListHeader>
					<DiscussionTitle>{list.title}</DiscussionTitle>
					<SubmitButton
						isRegistered={status === this.statics.registered}
						unregisterTalkRequest={this.unregisterTalkRequest}
						registerTalkRequest={this.registerTalkRequest}
					/>
					{user.isAdmin && this.renderAdminTools(true, list.id)}
					{/*
					TODO update this when discussion status is supported in the
					backend*/}
				</ListHeader>

				<ListTitle>Första talarlista</ListTitle>
				{list.speakersQueue
					.map((user, index) => createSpeakerRow(user, index))
					.reduce(
						(acc, item, i) =>
							acc.concat(
								i === 0 ? [item] : [<HR key={i} />, item]
							),
						[]
					)}

				<ListTitle>Andra talarlista</ListTitle>
				{list.speakersQueue
					.map((user, index) => createSpeakerRow(user, index))
					.reduce(
						(acc, item, i) =>
							acc.concat(
								i === 0 ? [item] : [<HR key={i} />, item]
							),
						[]
					)}
			</ListContainer>
		);
	}
}

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
  font-family: Helvetica Neue,Helvetica,Roboto,Arial,sans-serif;
  font-size: 1.25em;
  font-weight: bold;
  color: #4a4a4a;
  padding-top: 0.5em;
  padding-left: 1em;
`;

const DiscussionTitle = styled.div`
  font-family: Helvetica Neue,Helvetica,Roboto,Arial,sans-serif;
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

const SpeakerRow = styled.div`
  display: flex;
`;

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
