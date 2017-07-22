import React, { Component } from "react";
import styled from "styled-components";

import { connect } from "react-redux";

import { notesEdit } from "../actions.js";

import {
  ListContainer,
  ListHeader,
  DiscussionTitle
} from "../SharedComponents.js";

class Notes extends Component {
  handleNotesEdit = event => {
    this.props.onChangeNotes(event.target.value);
  };

  render() {
    const { notes } = this.props;
    return (
      <ListContainer>
        <ListHeader>
          <DiscussionTitle>Anteckningar</DiscussionTitle>
        </ListHeader>
        <InputContainer>
          <InputField onChange={this.handleNotesEdit} value={notes} />
        </InputContainer>
      </ListContainer>
    );
  }
}

const mapStateToProps = state => ({
  notes: state.notes
});

const mapDispatchToProps = dispatch => ({
  onChangeNotes: newNotes => dispatch(notesEdit(newNotes))
});

export default connect(mapStateToProps, mapDispatchToProps)(Notes);

const InputContainer = styled.div`
  display: flex;
  flex: 1;
`;

const InputField = styled.textarea`
  font-size: 1em;
  flex: 1;
  padding: 1rem;

  &:focus {
    outline: 0;
  }
`;
