import { authorizeSvelte } from '$lib/server/jwt';
import type { ServerLoad } from '@sveltejs/kit';
import WebSocket from 'ws';

export const load: ServerLoad = async ({ cookies }) => {
	const user = authorizeSvelte(cookies);
};

// export const chat: => {
// 	const port = 3000;
// const chat_id = 3;
// const ws = new WebSocket(`ws://localhost:${port}/chat/${chat_id}`);

// ws.on('open', () => {
// 	console.log('Client connected');
// 	ws.send(JSON.stringify({
// 		user: 'Manolo',
// 		message: "This is a message"
// 	}))
// });
// ws.on('message', (data) => {
// 	console.log('Client connected');

// });
// };



