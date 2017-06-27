import React, { Component } from "react";
import { toast } from "react-toastify";

import { getJson, postJson, sendDelete } from "./fetch.js";

class Admin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAdmin: false,
      authCode: "",
      nickToRemove: ""
    };
    this.handleAuthCodeChange = this.handleAuthCodeChange.bind(this);
    this.handleNickToRemoveChange = this.handleNickToRemoveChange.bind(this);
    this.removeUser = this.removeUser.bind(this);
    this.attemptAuth = this.attemptAuth.bind(this);
    this.getIsAdmin = this.getIsAdmin.bind(this);
  }

  newDiscussion() {
    postJson("/admin/discussion")
      .then(resp => {
        toast.success("Discussion added");
      })
      .catch(err => {
        toast.error(`Could not add discussion ${err}`);
      });
  }

  endDiscussion() {
    sendDelete("/admin/discussion")
      .then(resp => {
        toast.success("Discussion ended");
      })
      .catch(err => {
        toast.error(`Could not end discussion ${err}`);
      });
  }

  removeUser() {
    sendDelete("/admin/user", { nick: this.state.nickToRemove })
      .then(resp => {
        if (resp.status === 200) {
          toast.success(this.state.nickToRemove + "Removed from discussion");
        }
      })
      .catch(err => {
        toast.success(
          `Could not remove '${this.state.nickToRemove}' from discussion`
        );
      });
  }

  attemptAuth() {
    postJson("/admin", { code: this.state.authCode })
      .then(resp => {
        if (resp.status === 200) {
          toast.success("Authorization successfull!");
          this.setState({ isAdmin: true });
        } else {
          toast.error("Could not authorize, code not accepted.");
        }
      })
      .catch(err => toast.error("Not connected..."));
  }

  handleNickToRemoveChange(event) {
    this.setState({ nickToRemove: event.target.value });
  }

  handleAuthCodeChange(event) {
    this.setState({ authCode: event.target.value });
  }

  getIsAdmin() {
    getJson("/me")
      .then(resp => {
        console.log("data", resp);
        this.setState({ isAdmin: resp.isAdmin });
      })
      .catch(err => {
        toast.error(`Error getting admin status: ${err}`);
      });
  }

  render() {
    if (this.state.isAdmin) {
      return (
        <div>
          <input
            type="submit"
            value="Start new discussion"
            onClick={this.newDiscussion}
          />
          <input
            type="submit"
            value="End current discussion"
            onClick={this.endDiscussion}
          />
          <textarea
            value={this.state.nickToRemove}
            onChange={this.handleNickToRemoveChange}
          />
          <input type="submit" value="Remove user" onClick={this.removeUser} />
        </div>
      );
    } else {
      return (
        <div>
          <textarea
            value={this.state.authCode}
            onChange={this.handleAuthCodeChange}
          />
          <input
            type="submit"
            value="Attempt authorization"
            onClick={this.attemptAuth}
          />
        </div>
      );
    }
  }
}

export default Admin;
