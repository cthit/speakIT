import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import { injectGlobal } from "styled-components";

// eslint-disable-next-line
injectGlobal`
    *, *:before, *:after {
        box-sizing: border-box;
    }
`;

ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();
