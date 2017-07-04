import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

import ListsView from "./Lists/ListsView.js";
import User from "./User.js";
import Admin from "./Admin.js";
import AppHeader from "./AppHeader.js";

import { getJson, postJson } from "./fetch.js";

import backend from "./backend.js";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: {}
    };

    backend.connect("ws://localhost:3001/ws").then(() => {
      backend.socket.send(
        JSON.stringify({
          header: {
            type: "CLIENT_HELO"
          },
          content: {
            nick: "tejp",
            isAdmin: false,
            id: "eb3d3083-ebad-410d-8f84-df04d36726e8"
          }
        })
      );
    });
  }

  componentWillMount() {
    this.getUser();
  }

  getUser = () => {
    getJson("/me")
      .then(resp => {
        this.setState({
          user: resp
        });
      })
      .catch(err => {
        toast.error(`Could not get user: ${err.msg}`);
      });
  };

  updateUserNick = newNick => {
    postJson("/me", { nick: newNick })
      .then(resp => {
        this.setState({ user: resp });
        toast.success("User updated.");
      })
      .catch(err =>
        toast.error(`Could not update nick, not connected to server: ${err}`)
      );
  };

  renderList = () => <ListsView user={this.state.user} />;

  render() {
    const { user } = this.state;

    return (
      <Router>
        <div className="App">
          <ToastContainer />
          <AppHeader />
          <Route exact path="/" render={this.renderList} />
          <Route path="/list" render={this.renderList} />
          <Route
            path="/admin"
            render={() => <Admin user={user} updateUser={this.getUser} />}
          />
          <Route
            path="/user"
            render={() => <User user={user} updateUser={this.updateUserNick} />}
          />
        </div>
      </Router>
    );
  }
}

export default App;
