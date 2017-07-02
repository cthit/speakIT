import React, { Component } from "react";
import styled from "styled-components";

class SubmitButton extends Component {
	render() {
		const {
			isRegistered,
			unregisterTalkRequest,
			registerTalkRequest
		} = this.props;

		return (
			<StyledSubmitButton
				type="button"
				value={isRegistered ? "Stryk mig" : "Skriv upp mig"}
				onClick={
					isRegistered ? unregisterTalkRequest : registerTalkRequest
				}
			/>
		);
	}
}

export const StyledSubmitButton = styled.input`
  background-color: #7ed321;
  border: none;
  outline: none;
  padding: 15px 45px;
  font-weight: bold;
  :hover {
    cursor: pointer;
    background-color: #a4e063;
  }
  :active {
    background-color: #71bd1d;
  }
  :disabled {
    background-color: #c4c4c4;
  }
`;

export default SubmitButton;