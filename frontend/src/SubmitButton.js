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
  background-color: #00a8e2;
  transition: background-color 0.25s ease-out, color 0.25s ease-out;
  color: #fff;
  border: none;
  outline: none;
  padding: 15px 45px;
  font-size: 1.1em;
  :hover {
    cursor: pointer;
    background-color: #0090c2;
  }
  :active {
    background-color: #006b8f;
  }
  :disabled {
    background-color: #c4c4c4;
  }
`;

export default SubmitButton;
