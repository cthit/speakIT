import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { injectGlobal } from "styled-components";

// eslint-disable-next-line
injectGlobal`
    *, *:before, *:after {
        box-sizing: border-box;
    }

    body {
        margin: 0;
        padding-bottom: 2rem;
        font-family: 'Roboto', sans-serif;
        background: #F7F7F7;
    }
`;

ReactDOM.render(<App />, document.getElementById("root"));
