import React, { Component } from 'react';
import 'whatwg-fetch';

const BASE_URL = "http://localhost:3001";
const myFetch = (path, args) => {
    return fetch(BASE_URL+path, args);
};

class List extends Component {

    constructor(props) {
        super(props);

        this.statics = {
            unregistered: 'unregistered',
            waiting: 'waiting',
            registered: "registered",
        };

        this.state = {
            status: this.statics.unregistered
        }
    }

    updateSpeakersList() {
        console.log("Updating speakers list")
        myFetch('/list').then(a => console.log(a));
    }

    componentDidMount() {
        this.updateSpeakersList();
    }

    registerTalkRequest() {
        console.log("raise hand")


        myFetch("/list", {method: "POST"})
            .then(resp => {
                if (resp.status === 200) {
                    this.setState({status: this.statics.registered});
                } else {
                    console.error("Could not register to the speakers list.", resp)
                }
            })
    }

    unregisterTalkRequest() {
        console.log("lower hand")
        this.setState({status: this.statics.unregistered});

        myFetch("/list", {
            method: "DELETE",
            'Access-Control-Allow-Methods': 'GET,POST,DELETE'
        }).then(resp => {
                if (resp.status === 200) {
                    this.setState({status: this.statics.unregistered});
                } else {
                    console.error("Could not unregister to the speakers list.", resp)
                }
            })
    }

    render() {

        let { status } = this.state;
        console.log(status);
        return (
            <div>
                <div>This is the list</div>
                <input type="submit"
                       value={ status === this.statics.unregistered ? "I want to talk" : "I don't want to talk"}
                       onClick={status === this.statics.unregistered ? () => this.registerTalkRequest() : () => this.unregisterTalkRequest()}/>
            </div>
        );
    }
}

export default List;
