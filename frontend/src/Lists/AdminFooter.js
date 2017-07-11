import React, { Component } from "react";
import FontAwesome from "react-fontawesome";
import styled from "styled-components";

class AdminFooter extends Component {
	render() {
		const { className, onClick } = this.props;
		return (
			<Footer className={className} onClick={onClick}>
				Avsluta diskussionen <FontAwesome name="trash" />
			</Footer>
		);
	}
}

const Footer = styled.div`
	background-color: #f5f5f5;
	line-height: 2.5em;
	text-align: center;
	color: #4990e2;
	:hover {
		opacity: 0.7;
	}
	:active {
		opacity: 0.9;	
	}
`;

export default AdminFooter;
