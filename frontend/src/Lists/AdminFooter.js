import React, { Component } from "react";
import FontAwesome from "react-fontawesome";
import styled from "styled-components";

class AdminFooter extends Component {
	render() {
		const { className, onClick } = this.props;
		return (
			<Footer className={className} onClick={onClick}>
				End discussion <FontAwesome name="trash" />
			</Footer>
		);
	}
}

const Footer = styled.div`
	line-height: 2.5em;
	text-align: center;
	cursor: pointer;
	color: #4990e2;
	background-color: #f5f5f5;
  :hover {
    background-color: #e5e5e5;
  }
  :active {
    background-color: #d5d5d5;
  }
`;

export default AdminFooter;
