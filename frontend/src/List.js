import React, { Component } from "react";
import "whatwg-fetch";

import { getJson, postJson, sendDelete } from "./fetch.js";

class List extends Component {
  constructor(props) {
    super(props);

    this.statics = {
      unregistered: "unregistered",
      waiting: "waiting",
      registered: "registered"
    };

    this.state = {
      status: this.statics.unregistered,
      speakersList: []
    };
  }

  updateSpeakersList() {
    console.log("Updating speakers list");
    getJson("/list").then();
  }

  componentDidMount() {
    this.updateSpeakersList();
  }

  registerTalkRequest() {
    console.log("raise hand");

    postJson("/list")
      .then(resp => {
        this.setState({ status: this.statics.registered });
      })
      .catch(err => {
        console.error("Could not register to the speakers list.", err);
      });
  }

  unregisterTalkRequest() {
    console.log("lower hand");
    this.setState({ status: this.statics.unregistered });

    sendDelete("/list")
      .then(resp => {
        this.setState({ status: this.statics.unregistered });
      })
      .catch(err => {
        console.error("Could not unregister from the speakers list.", err);
      });
  }

  render() {
    let { status } = this.state;
    console.log(status);
    return (
      <div>
        <div>This is the list</div>
        <input
          type="submit"
          value={
            status === this.statics.unregistered
              ? "I want to talk"
              : "I don't want to talk"
          }
          onClick={
            status === this.statics.unregistered
              ? () => this.registerTalkRequest()
              : () => this.unregisterTalkRequest()
          }
        />
      </div>
    );
  }
}

export default List;
