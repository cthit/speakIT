import React, { Component } from "react";
import { toast } from "react-toastify";

const BASE_URL = "http://83.254.25.245:3001/";
const myFetch = (path, args) => {
  return fetch(BASE_URL + path, args);
};

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
    myFetch("/admin/discussion", { method: "POST" }).then(resp => {
      if (resp.status === 200) {
        toast.success("Discussion added");
      }
    });
  }

  endDiscussion() {
    myFetch("/admin/discussion", { method: "DELETE" }).then(resp => {
      if (resp.status === 200) {
        toast.success("dDscussion ended");
      }
    });
  }

  removeUser() {
    myFetch("/admin/user", {
      method: "DELETE",
      body: JSON.stringify({ nick: this.state.nickToRemove })
    }).then(resp => {
      if (resp.status === 200) {
        toast.success(this.state.nickToRemove + "Removed from discussion");
      }
    });
  }

  attemptAuth() {
    myFetch("/admin", {
      method: "POST",
      body: JSON.stringify({ code: this.state.authCode })
    })
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
    myFetch("/me").then(resp => {
      if (resp.status === 200) {
        resp.json().then(data => {
          console.log("data", data);
          this.setState({ isAdmin: data.isAdmin });
        });
      }
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
