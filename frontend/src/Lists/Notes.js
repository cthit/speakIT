import React, { Component } from "react";
import styled from "styled-components";

import store from "../store.js";
import { notesEdit } from "../actions.js";

import debounce from "lodash/debounce";

import { ListContainer, ListHeader, ListTitle } from "../SharedComponents.js";

class Notes extends Component {
	constructor(props) {
		super(props);
		this.state = {
			notes: ""
		};
	}

	componentWillMount() {
		this.setState({
			notes: this.props.notes
		});
	}

	handleNotesEdit = event => {
		this.setState({
			notes: event.target.value
		});
		this.dispatchToStore();
	};

	dispatchToStore = debounce(() => {
		store.dispatch(notesEdit(this.state.notes));
	}, 300);

	render() {
		const { notes } = this.state;
		return (
			<ListContainer>
				<ListHeader>
					<ListTitle>Anteckningar</ListTitle>
				</ListHeader>
				<InputContainer>
					<InputField onChange={this.handleNotesEdit} value={notes} />
				</InputContainer>
			</ListContainer>
		);
	}
}

export default Notes;

const InputContainer = styled.div`
	display: flex;
	flex: 1;
`;

const InputField = styled.textarea`
	font-size: 1em;
	flex: 1;
	padding: 0.5em;
`;
