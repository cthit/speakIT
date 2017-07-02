import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

import ListsView from "./Lists/ListsView.js";
import User from "./User.js";
import Admin from "./Admin.js";
import AppHeader from "./AppHeader.js";

class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <ToastContainer />
          <AppHeader />
          <Route exact path="/" component={ListsView} />
          <Route path="/list" component={ListsView} />
          <Route path="/admin" component={Admin} />
          <Route path="/user" component={User} />
        </div>
      </Router>
    );
  }
}

export default App;
