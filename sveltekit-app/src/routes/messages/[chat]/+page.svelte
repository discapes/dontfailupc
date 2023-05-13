<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import ChatMessage from './ChatMessage.svelte';

	import Fa from 'svelte-fa';
	import {
		faUsers,
		faCompressArrowsAlt,
		faComments,
		faEnvelope
	} from '@fortawesome/free-solid-svg-icons';

	var messages: Message[] = [];

	type Message = {
		user: string;
		message: string;
		timestamp: number;
	};
	let text = '';
	let profilePic =
		'https://t3.ftcdn.net/jpg/03/39/45/96/360_F_339459697_XAFacNQmwnvJRqe1Fe9VOptPWMUxlZP8.jpg';
	const port = 3000;
	const chat_id = 3;
	const ws = new WebSocket(`ws://localhost:${port}/chat/${chat_id}`);

	if (browser) {
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
	function handleClick() {
		let message: Message = {
			user: 'manolo',
			message: text,
			timestamp: 0
		};
		let serde: string = JSON.stringify(message);
		ws.send(serde);
		text = '';
	}
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
	/>
</svelte:head>
<div class="card card-danger grow flex flex-col">
	<div class="card-header flex items-center gap-3">
		<Fa icon={faUsers} />{$page.params.chat}
	</div>
	<div class="grow">
		<div class="direct-chat-messages">
			{#each messages as message}
				<ChatMessage nameMe={message.user} {profilePic} message={message.message} />
			{/each}
		</div>
	</div>
	<div class="card-footer">
		<div class="input-group">
			<input type="text" placeholder="Type Message ..." class="form-control" bind:value={text} />
			<span class="input-group-append">
				<button type="button" class="btn btn-primary" on:click={() => handleClick()}>Send</button>
			</span>
		</div>
	</div>
</div>

<style>
	.card-header {
		background-color: cornflowerblue;
	}
	.direct-chat-messages {
		-webkit-transform: translate(0, 0);
		transform: translate(0, 0);
		overflow: auto;
		padding: 10px;
		transition: -webkit-transform 0.5s ease-in-out;
		transition: transform 0.5s ease-in-out;
		transition: transform 0.5s ease-in-out, -webkit-transform 0.5s ease-in-out;
	}
</style>
