import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

import ListsView from "./Lists/ListsView.js";
import User from "./User.js";
import Admin from "./Admin.js";
import AppHeader from "./AppHeader.js";

import { postJson } from "./fetch.js";

import backend from "./backend.js";

import { Provider, connect } from "react-redux";
import store from "./store.js";
import { requestUserUpdate } from "./actions.js";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: {}
    };
  }

  componentWillMount() {
    backend.connect("ws://localhost:3001/ws").then(() => {
      requestUserUpdate();
    });
  }

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
    const { user } = this.props;

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
          <Route path="/user" render={() => <User user={user} />} />
        </div>
      </Router>
    );
  }
}

const ConnectedApp = connect(state => ({
  user: state.user
}))(App);

const ProviderApp = () =>
  <Provider store={store}>
    <ConnectedApp />
  </Provider>;

export default ProviderApp;
