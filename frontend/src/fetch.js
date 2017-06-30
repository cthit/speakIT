const BASE_URL = "http://83.254.25.245:3001";

const myFetch = (path, args) => {
	return fetch(BASE_URL + path, {
		...args,
		credentials: "include"
	});
};

const checkResponse = resp => {
	if (200 <= resp.status && resp.status < 300) {
		return resp;
	} else {
		return resp.json().then(obj => {
			throw obj;
		});
	}
};

export const getJson = (path, args) => {
	return myFetch(path, args).then(checkResponse).then(resp => resp.json());
};

export const postJson = (path, body) => {
	return myFetch(path, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(body)
	})
		.then(checkResponse)
		.then(resp => resp.json());
};

export const sendDelete = (path, body) => {
	return myFetch(path, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(body)
	}).then(checkResponse);
};

export const getUser = () => {
	return getJson("/me");
};
