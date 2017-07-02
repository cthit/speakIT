import React, { Component } from "react";
import styled from "styled-components";
import FontAwesome from "react-fontawesome";

class AdminToolBar extends Component {
	render() {
		const { listId, debateIsOpen, toggleDiscussionStatus } = this.props;

		const debateBackground = debateIsOpen
			? {}
			: { "background-color": "#d8d8d8" };

		return (
			<ToolBar>
				<ToolBarItem>
					<FontAwesome
						name="stack-overflow"
						size="2x"
						flip="horizontal"
					/>
					<br />{" "}
					Nästa
				</ToolBarItem>
				<ToolBarItem
					style={debateBackground}
					onClick={() => toggleDiscussionStatus(listId)}
				>
					<FontAwesome name="users" size="2x" /><br />Streck i
					debatten
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
	flex: 1;
	font-size: 0.8em;
	text-align: center;
	padding: 1.5em 0.5em;
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
