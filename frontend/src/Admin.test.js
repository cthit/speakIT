import React from "react";
import { Provider } from "react-redux";
import store from "./store.js";
import ReactDOM from "react-dom";
import Admin from "./Admin";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<Provider store={store}><Admin /></Provider>, div);
});
