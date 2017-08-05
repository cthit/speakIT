import React from "react";
import ReactDOM from "react-dom";
import Admin from "./Admin";

it("renders without crashing", () => {
	const div = document.createElement("div");
	ReactDOM.render(
		<Admin
			user={{
				nick: "",
				isAdmin: true,
				id: "ef9711bd-1ac2-4f6f-88a9-12c35aa47fe2"
			}}
			users={[
				{
					nick: "",
					isAdmin: true,
					id: "ef9711bd-1ac2-4f6f-88a9-12c35aa47fe2"
				}
			]}
			adminCreatedUsers={[]}
		/>,
		div
	);
});
