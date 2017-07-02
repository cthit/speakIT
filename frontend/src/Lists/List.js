import React, { Component } from "react";

import styled from "styled-components";
import FontAwesome from "react-fontawesome";

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
	render() {
		const { list } = this.props;

		return (
			<ListContainer key={list.id}>
				<ListHeader>
					<DiscussionTitle>{list.title}</DiscussionTitle>
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
  height: 98px;
  border: solid 1px #979797;
  background-color: #efeeee;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
