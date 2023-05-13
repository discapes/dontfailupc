<script lang="ts">
	import { browser } from '$app/environment';
	import type { Message } from '$lib/types';
	import type { PageData } from './$types';
	import ChatMessage from './ChatMessage.svelte';

	export let data: PageData;

	var messages: Message[] = [];

	let pic =
		'https://t3.ftcdn.net/jpg/03/39/45/96/360_F_339459697_XAFacNQmwnvJRqe1Fe9VOptPWMUxlZP8.jpg';
	const port = 3000;
	const chat_id = 3;
	let ws: WebSocket;
	if (browser) {
		ws = new WebSocket(`ws://localhost:${port}/chat/${chat_id}`);

		ws.onopen = function () {
			console.log('connection opened');
			ws.onmessage = function (e) {
				let msg = JSON.parse(e.data);
				if (messages.length == 0) {
					messages = msg;
				} else {
					messages = [...messages, msg[0]];
				}
				console.log('received message: ' + messages);
			};
		};
	}

	function scrollBottom() {
		const dc = document!.querySelector('.direct-chat-messages')!.parentElement!;
		setTimeout(() => (dc.scrollTop = dc?.scrollHeight ?? 0), 1);
	}

	function kd(this: any) {
		if (this.msg.value && data.auth) {
			const msg = this.msg.value;
			let message: Message = {
				user: data.auth.email,
				message: msg,
				timestamp: Date.now()
			};
			ws.send(JSON.stringify(message));
			this.reset();
			scrollBottom();
		} else if (this.msg.value) {
			alert('You need to be logged in.');
		}
	}
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
	/>
</svelte:head>

<div class="grow card card-danger direct-chat direct-chat-danger h-full w-full">
	<div class="card-body">
		<div class="direct-chat-messages">
			{#each messages as message}
				<ChatMessage {pic} {message} right={message.user == data.auth?.email} />
			{/each}
		</div>
	</div>
	<div class="card-footer">
		<form class="input-group" on:submit|preventDefault={kd}>
			<input type="text" name="msg" placeholder="Type Message ..." class="form-control" />
			<span class="input-group-append">
				<input type="submit" class="btn btn-primary bg-[#007bff]" value="Send" />
			</span>
		</form>
	</div>
</div>

<style>
	.direct-chat .card-body {
		overflow-x: hidden;
		padding: 0;
		position: relative;
	}

	.direct-chat-messages {
		-webkit-transform: translate(0, 0);
		transform: translate(0, 0);
		/* height: 350px; */
		overflow: auto;
		padding: 10px;
		transition: -webkit-transform 0.5s ease-in-out;
		transition: transform 0.5s ease-in-out;
		transition: transform 0.5s ease-in-out, -webkit-transform 0.5s ease-in-out;
	}
</style>
