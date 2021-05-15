import React, { Component } from "react";
import FontAwesome from "react-fontawesome";

import { ToolBarButton } from "../SharedComponents.js";

class AdminFooter extends Component {
	render() {
		const { className, resetList, deleteList, inactive } = this.props;
		return (
			<div>
				<Footer className={className} onClick={resetList} inactive={inactive}>
					Reset discussion <FontAwesome name="retweet" />
				</Footer>
				<Footer className={className} onClick={deleteList} inactive={inactive}>
					End discussion <FontAwesome name="trash" />
				</Footer>
			</div>
		);
	}
}

const Footer = ToolBarButton.extend`
	line-height: 2.5em;
	text-align: center;
	color: #4990e2;
`;

export default AdminFooter;
