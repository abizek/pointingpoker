import { useSyncExternalStore } from "react";
import { getName } from "./name.js";

let data = { votes: {} };

const eventSource = new EventSource(
	`${import.meta.env.VITE_SERVER_BASE_URL}/events/${getName()}`
);

eventSource.addEventListener("message", (event) => {
	data = JSON.parse(event.data);
	console.log("new data", data);
});

function subscribe(callback) {
	eventSource.addEventListener("message", callback);

	return () => eventSource.removeEventListener("message", callback);
}

function getSnapshot() {
	return data;
}

export function useStore() {
	return useSyncExternalStore(subscribe, getSnapshot);
}