import React, { Component } from "react";

class Nick extends Component {
  constructor(props) {
    super(props);

    this.state = {
      notUpdatedNick: this.props.nick
    };
    this.handleChange = this.handleChange.bind(this);
    this.updateNick = this.updateNick.bind(this);
  }

  handleChange(event) {
    this.setState({ notUpdatedNick: event.target.value });
  }

  updateNick() {
    this.props.onNickChange(this.state.notUpdatedNick);
  }

  render() {
    return (
      <div>
        <textarea
          value={this.props.notUpdatedNick}
          onChange={this.handleChange}
        />
        <input type="submit" value="Update Nick" onClick={this.updateNick} />
      </div>
    );
  }
}

export default Nick;
