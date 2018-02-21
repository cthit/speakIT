import { dispatchActionFromTopic, sendClientHello } from "./actions.js";
import conf from "./config.js";
import { toast } from "react-toastify";

class Backend {
  startKeepAlivePoller() {
    setInterval(() => {
      if (
        this.socket.readyState !== this.socket.OPEN &&
        this.socket.readyState !== this.socket.CONNECTING
      ) {
        this.connect();
      }
    }, 25000);
  }

  connect() {
    this.url = `${conf.backend_address}/ws`;

    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.url);
      this.socket.onmessage = this._messageReceive;
      this.socket.onclose = this.socketClosed;
      this.socket.onopen = () => resolve(this);
    })
      .then(() => {
        sendClientHello();
      })
      .catch(err => {
        console.log(err);
        toast.error(`Error: ${err}`);
      });
  }

  _messageReceive = event => {
    const s = event.data;
    const type = s.substr(0, s.indexOf(" "));
    const content = s.substr(s.indexOf(" ") + 1);
    dispatchActionFromTopic(type, JSON.parse(content));
  };

  socketClosed = event => {
    console.log("socketClosed: ", event);
  };

  send = (msg, obj = {}) => {
    if (
      this.socket.readyState !== this.socket.OPEN &&
      this.socket.readyState !== this.socket.CONNECTING
    ) {
      console.log(
        "Send, socket is not OPEN, restarting websocket and sending new, socketstate is:",
        this.socket.readyState
      );
      this.connect().then(() => {
        this.socket.send(msg + " " + JSON.stringify(obj));
      });
    } else {
      this.socket.send(msg + " " + JSON.stringify(obj));
    }
  };
}

export default new Backend();
