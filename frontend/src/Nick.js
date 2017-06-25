import React, { Component } from "react";
import FontAwesome from "react-fontawesome";

class Nick extends Component {
  constructor(props) {
    super(props);

    this.state = {
      notUpdatedNick: this.props.nick,
      changingNick: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.updateNick = this.updateNick.bind(this);
    this.changingNick = this.changingNick.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  handleChange(event) {
    this.setState({ notUpdatedNick: event.target.value });
  }

  updateNick() {
    this.props.onNickChange(this.state.notUpdatedNick);
    this.setState({ changingNick: false });
  }

  changingNick() {
    this.setState({ changingNick: true });
  }

  handleKeyPress(event) {
    if (event.key === "Enter") {
      this.updateNick();
    }
  }

  render() {
    if (this.state.changingNick) {
      return (
        <div>
          <input
            type="text"
            className="inline nick-input"
            value={this.state.notUpdatedNick}
            onChange={this.handleChange}
            onKeyPress={this.handleKeyPress}
          />
          <FontAwesome
            name="check"
            className="icon inline"
            onClick={this.updateNick}
          />
        </div>
      );
    } else {
      return (
        <div>
          <h2 className="inline">
            {this.props.nick}
          </h2>
          <FontAwesome
            name="pencil"
            className="icon inline"
            onClick={this.changingNick}
          />
        </div>
      );
    }
  }
}

export default Nick;
