import React, { Component } from "react";

import {
  Container,
  SubContainer,
  Row,
  RowContent,
  Input,
  ListTitle
} from "./SharedComponents.js";

import SubmitButton from "./SubmitButton.js";

class EntryPoint extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentID: "",
    }
  }

  handleChange = (event) => {
    this.setState({currentID: event.target.value})
  }

  handleEnterClick = () => {

  }
  
  render() {
    const { currentID } = this.state;
    return (

      <Container>
      <SubContainer>
          <ListTitle>Speaker List ID:</ListTitle>
          <Row>
            <RowContent>
                <Input
                  type="text"
                  onChange={this.handleChange}
                  value={currentID}
                />
            </RowContent>
          </Row>
           <Row>
            <SubmitButton
                positiveText="Enter"
                isShowingPositive={true}
                type="button"
                value="enter"
                disabled={!currentID}
                onPositiveClick={null}
              />
            </Row>
        </SubContainer>
      </Container>
    );
  }
}

export default EntryPoint;
