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
		const parts = event.data.split(" ");
		const parsed = JSON.parse(parts[1]);
		dispatchActionFromTopic(parts[0], parsed);
	};

	socketClosed = event => {
		console.log("socketClosed: ", event);
	};
}

export default new Backend();
