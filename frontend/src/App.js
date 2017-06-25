import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Route } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

import List from "./List.js";
import Nick from "./Nick.js";
import Admin from "./Admin.js";

const BASE_URL = "http://83.254.25.245:3001/";
const myFetch = (path, args) => {
  return fetch(BASE_URL + path, args);
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      nick: "New User"
    };
    this.updateNick = this.updateNick.bind(this);
    this.getNick = this.getNick.bind(this);
  }

  componentDidMount() {
    this.getNick();
  }

  updateNick(newNick) {
    myFetch("/me", {
      method: "POST",
      body: JSON.stringify({ nick: newNick })
    })
      .then(resp => {
        if (resp.status === 200) {
          this.setState({ nick: newNick });
          toast.success("Nick updated successfully!");
        } else {
          toast.error("Could not update nick.");
        }
      })
      .catch(err =>
        toast.error("Could not update nick, not connected to server.")
      );
  }

  getNick() {
    myFetch("/me").then(resp => {
      if (resp.status === 200) {
        resp.json().then(data => {
          console.log("data", data);
          this.setState({ nick: data.nick });
        });
      }
    });
  }

  render() {
    return (
      <Router>
        <div className="App">
          <ToastContainer />
          <div className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <br />
            <h2 className="inline">Welcome to React, </h2>
            <Nick nick={this.state.nick} onNickChange={this.updateNick} />
          </div>
          <Route path="/list" component={List} />
          <Route path="/admin" component={Admin} />
        </div>
      </Router>
    );
  }
}

export default App;
