import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router, Route} from 'react-router-dom';

import List from './List.js'

class App extends Component {
    render() {
        return (
            <Router>

                <div className="App">
                    <div className="App-header">
                        <img src={logo} className="App-logo" alt="logo" />
                        <h2>Welcome to React</h2>
                    </div>
                    <Route path="/list" component={List}/>
                </div>


            </Router>
        );
    }
}

export default App;
