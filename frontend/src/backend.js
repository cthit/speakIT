import { dispatchActionFromTopic } from "./actions.js";

class Backend {
  connect(url) {
    this.url = url;

    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(this.url);
      this.socket.onmessage = this._messageReceive;
      this.socket.onclose = this.socketClosed;
      this.socket.onopen = () => resolve(this);
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
    this.socket.send(msg + " " + JSON.stringify(obj));
  };
}

export default new Backend();
