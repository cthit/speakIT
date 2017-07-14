import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

import ListsView from "./Lists/ListsView.js";
import User from "./User.js";
import Admin from "./Admin.js";
import AppHeader from "./AppHeader.js";

import backend from "./backend.js";

import { Provider, connect } from "react-redux";
import store from "./store.js";
import { sendClientHello } from "./actions.js";
import conf from "./config.js";

class App extends Component {
  componentWillMount() {
    window.backend = backend;
    backend
      .connect(`ws://${conf.backend_address}:${conf.backend_port}/ws`)
      .then(() => {
        sendClientHello();
      })
      .catch(err => {
        console.log(err);
        toast.error(`Error: ${err}`);
      });
  }

  renderList = () => {
    const { user, lists, listsGetWaiting } = this.props;
    return <ListsView user={user} lists={lists} loading={listsGetWaiting} />;
  };

  render() {
    const { user, userGetWaiting } = this.props;

    return (
      <Router>
        <div className="App">
          <ToastContainer />
          <AppHeader />
          <Route exact path="/" render={this.renderList} />
          <Route path="/list" render={this.renderList} />
          <Route path="/admin" render={() => <Admin user={user} />} />
          <Route
            path="/user"
            render={() => <User user={user} loading={userGetWaiting} />}
          />
        </div>
      </Router>
    );
  }
}

const ConnectedApp = connect(state => ({
  user: state.user,
  userGetWaiting: state.userGetWaiting,
  lists: state.lists,
  listsGetWaiting: state.listsGetWaiting
}))(App);

const ProviderApp = () =>
  <Provider store={store}>
    <ConnectedApp />
  </Provider>;

export default ProviderApp;
