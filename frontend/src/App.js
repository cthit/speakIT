import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

import List from "./List.js";
//import Nick from "./Nick.js";
import Admin from "./Admin.js";
import AppHeader from "./AppHeader.js";

import { getJson, postJson } from "./fetch.js";

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
    postJson("/me", { nick: newNick })
      .then(resp => {
        this.setState({ nick: resp.nick });
        toast.success("Nick updated successfully!");
      })
      .catch(err =>
        toast.error(`Could not update nick, not connected to server: ${err}`)
      );
  }

  getNick() {
    getJson("/me")
      .then(resp => {
        console.log("data", resp);
        if (resp.nick !== "") {
          this.setState({ nick: resp.nick });
        }
      })
      .catch(err => {
        toast.error(`Could not get user: ${err.msg}`);
      });
  }

  render() {
    return (
      <Router>
        <div className="App">
          <ToastContainer />
          <AppHeader />
          <Route exact path="/" component={List} />
          <Route path="/list" component={List} />
          <Route path="/admin" component={Admin} />
        </div>
      </Router>
    );
  }
}

export default App;
