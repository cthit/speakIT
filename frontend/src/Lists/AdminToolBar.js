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
			: { "background-color": "#d8d8d8" };

		return (
			<ToolBar className={className}>
				<ToolBarItem onClick={onNextClick}>
					<FontAwesome
						name="stack-overflow"
						size="2x"
						flip="horizontal"
					/>
					<br /> Nästa
				</ToolBarItem>
				<ToolBarItem
					style={debateBackground}
					onClick={() =>
						setDiscussionStatus(
							discussionIsOpen ? "closed" : "open"
						)}
				>
					<FontAwesome name="users" size="2x" />
					<br />Streck i debatten
				</ToolBarItem>
				<ToolBarItem onClick={onAddUser}>
					<FontAwesome name="user-plus" size="2x" />
					<br />Lägg till person
				</ToolBarItem>
			</ToolBar>
		);
	}
}

const ToolBar = styled.div`
	display: flex;
	border-bottom 1px solid #e5e5e5;
`;

const ToolBarItem = styled.div`
	cursor: pointer;
	flex: 1;
	font-size: 0.8em;
	text-align: center;
	padding: 1.5em 0;
	line-height: 2em;
	background-color: #f5f5f5;
	color: #4990e2;
	height: 3em;
	:hover {
		background-color: #fafafa;
	}
	:active {
		background-color: #e5e5e5;
	}
`;

export default AdminToolBar;
