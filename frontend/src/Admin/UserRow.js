import React, { Component } from "react";
import styled from "styled-components";
import FontAwesome from "react-fontawesome";

import { Row } from "../SharedComponents.js";
import store from "../store.js";
import { requestUserDelete, requestUserUpdate } from "../actions.js";

class UserRow extends Component {
	constructor(props) {
		super(props);
		this.state = {
			editing: false,
			userNick: props.user.nick,
			newNick: props.user.nick
		};
	}

	toggleEdit = () => {
		this.setState({
			editing: !this.state.editing
		});
	};

	removeUser = user => {
		store.dispatch(requestUserDelete(user));
	};

	onNickInputChange = e => {
		this.setState({
			newNick: e.target.value
		});
	};

	updateNick = () => {
		const { user } = this.props;
		const { newNick } = this.state;
		store.dispatch(requestUserUpdate({ ...user, nick: newNick }));
	};

	render() {
		const { user , removeEnabled} = this.props;
		const { editing, newNick } = this.state;

		return (
			<Row>
				{user.isAdmin
					? <AdminIcon name="user-circle-o" />
					: <AdminIconPlaceholder name="user-circle-o" />}{" "}
				{!editing && <Nick>{user.nick}</Nick>}
				{editing &&
					<EditingNick
						autoFocus
						value={newNick}
						onChange={this.onNickInputChange}
					/>}
				{editing &&
					<div>
						<ActionIconPositive
							name="check"
							onClick={this.updateNick}
						/>
						<ActionIconNegative
							name="times"
							onClick={this.toggleEdit}
						/>
          </div>}
					<div>
        {!editing &&
						<ActionIconPositive
							name="pencil"
							onClick={this.toggleEdit}
						/>}
				{!editing && removeEnabled &&
					<ActionIconNegative
							name="trash"
							onClick={() => this.removeUser(user)}
						/>}
					</div>

			</Row>
		);
	}
}

export default UserRow;

const AdminIcon = styled(FontAwesome)`
  margin-left: 1.5em;
  margin-right: .5em;
  color: #7ed321;
`;

const AdminIconPlaceholder = styled(AdminIcon)`
  color: transparent;
`;

const Nick = styled.div`
  flex: 3;
  text-align: left;
`;

const EditingNick = styled.input`
  flex: 3;
  text-align: left;
  border: none;
  border-bottom: 1px solid black;
  outline: none;
`;

const ActionIcon = styled(FontAwesome)`
  margin-right: .5em;
`;

const ActionIconPositive = styled(ActionIcon)`
  :hover {
    color: #a4e063;
  }
  :active {
    color: #94d053;
  }
`;
const ActionIconNegative = styled(ActionIcon)`
  :hover {
    color: #d0011b;
  }
  :active {
    color: #c0001b;
  }
`;
