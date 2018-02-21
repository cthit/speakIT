import React, { Component } from "react";
import FontAwesome from "react-fontawesome";

import { ToolBarButton } from "../SharedComponents.js";

class AdminFooter extends Component {
	render() {
		const { className, onClick, inactive } = this.props;
		return (
			<Footer className={className} onClick={onClick} inactive={inactive}>
				End discussion <FontAwesome name="trash" />
			</Footer>
		);
	}
}

const Footer = ToolBarButton.extend`
	line-height: 2.5em;
	text-align: center;
	color: #4990e2;
`;

export default AdminFooter;
