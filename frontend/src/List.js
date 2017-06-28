import React, { Component } from "react";
import { toast } from "react-toastify";
import "whatwg-fetch";

import { getJson, postJson, sendDelete } from "./fetch.js";

class List extends Component {
  constructor(props) {
    super(props);

    this.statics = {
      notRegistered: "notRegistered",
      waiting: "waiting",
      registered: "registered"
    };

    this.state = {
      status: this.statics.notRegistered,
      speakerLists: []
    };
  }

  updateSpeakersList = () => {
    console.log("Updating speakers list");
    getJson("/list").then(resp => {
      const activeList = resp[resp.length - 1];
      console.log(activeList);

      this.setState({ speakerLists: resp });
    });
  };

  componentDidMount() {
    this.updateSpeakersList();
  }

  registerTalkRequest = () => {
    console.log("raise hand");

    postJson("/list")
      .then(resp => {
        this.setState({ status: this.statics.registered });
      })
      .then(this.updateSpeakersList)
      .catch(err => {
        console.error("Could not register to the speakers list.", err);
      });
  };

  unregisterTalkRequest() {
    console.log("lower hand");
    this.setState({ status: this.statics.notRegistered });

    sendDelete("/list")
      .then(resp => {
        this.setState({ status: this.statics.notRegistered });
      })
      .then(this.updateSpeakersList)
      .catch(err => {
        console.error("Could not unregister from the speakers list.", err);
        toast.error(`Could not unregister from the speakers list: ${err}`);
      });
  }

  render() {
    let { status, speakerLists } = this.state;
    console.log(status);
    return (
      <div>
        <input
          type="submit"
          value={
            status === this.statics.notRegistered
              ? "I want to talk"
              : "I don't want to talk"
          }
          onClick={
            status === this.statics.notRegistered
              ? () => this.registerTalkRequest()
              : () => this.unregisterTalkRequest()
          }
        />
        <div>
          {speakerLists.map(list => {
            return (
              <div key={list.id}>
                <h3>{list.title}</h3>
                {list.speakersQueue.map(user => {
                  return <h5 key={user.id}>{user.nick}</h5>;
                })}
              </div>
            );
          })}
        </div>

      </div>
    );
  }
}

export default List;
