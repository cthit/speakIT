import React, { Component } from "react";

import ReactLoading from "react-loading";

import { Container, SubContainer, Row } from "./SharedComponents.js";

class Loading extends Component {
	render() {
		return (
			<Container>
				<SubContainer>
					<Row>
						<ReactLoading type="spinningBubbles" color="#c4c4c4" />
					</Row>
				</SubContainer>
			</Container>
		);
	}
}

export default Loading;
