import React, { Component } from "react";
import styled from "styled-components";

class SubmitButton extends Component {
	render() {
		const {
			isShowingPositive,
			onNegativeClick,
			onPositiveClick,
			disabled,
			positiveText,
			negativeText
		} = this.props;

		return (
			<StyledSubmitButton
				disabled={disabled}
				type="button"
				value={isShowingPositive ? positiveText : negativeText}
				onClick={isShowingPositive ? onPositiveClick : onNegativeClick}
			/>
		);
	}
}

export const StyledSubmitButton = styled.input`
	background-color: #7ed321;
	border: none;
	outline: none;
	padding: 15px 45px;
	font-size: 1.1em;
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
