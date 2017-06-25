import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Route } from "react-router-dom";

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
    }).then(resp => {
      if (resp.status === 200) {
        this.setState({ nick: newNick });
      } else {
        console.log("Could not update nick, are you connected to the server?");
      }
    });
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
          <div className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h2>Welcome to React, {this.state.nick}</h2>
          </div>
          <Nick nick={this.state.nick} onNickChange={this.updateNick} />
          <Route path="/list" component={List} />
          <Route path="/admin" component={Admin} />
        </div>
      </Router>
    );
  }
}

export default App;
