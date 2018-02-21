import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

import ListsView from "./Lists/ListsView.js";
import User from "./User.js";
import Admin from "./Admin";
import AppHeader from "./AppHeader.js";

import backend from "./backend.js";

import { Provider, connect } from "react-redux";
import store from "./store.js";

class App extends Component {
  componentWillMount() {
    window.backend = backend;
    backend.connect().finally(a => {
      backend.startKeepAlivePoller();
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
        <div>
          <ToastContainer />
          <AppHeader />
          <Route exact path="/" render={this.renderList} />
          <Route path="/list" render={this.renderList} />
          <Route path="/admin" component={Admin} />
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
  user: state.user.user,
  userGetWaiting: state.user.userGetWaiting,
  listsGetWaiting: state.lists.listsGetWaiting,
  lists: state.lists.lists
}))(App);

const ProviderApp = () => (
  <Provider store={store}>
    <ConnectedApp />
  </Provider>
);

export default ProviderApp;
