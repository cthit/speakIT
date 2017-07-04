class Backend {
	connect(url) {
		this.url = url;

		return new Promise((resolve, reject) => {
			this.socket = new WebSocket(this.url);
			this.socket.onMessage = this.messageReceive;
			this.socket.onclose = this.socketClosed;
			this.socket.onopen = () => resolve(this);
		});
	}

	messageReceive = event => {
		console.log("messageReceive: ", event);
	};

	socketClosed = event => {
		console.log("socketClosed: ", event);
	};
}

export default new Backend();
