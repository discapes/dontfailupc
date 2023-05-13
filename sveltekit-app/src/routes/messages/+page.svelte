<script lang="ts">
	import { page } from '$app/stores';

	type Chat = {
		name: string;
		id: number;
	};
	let chat1: Chat = {
		name: 'Chat1',
		id: 1
	};
	let chat2: Chat = {
		name: 'Chat2',
		id: 2
	};
	let chat3: Chat = {
		name: 'Chat3',
		id: 3
	};
	let chat4: Chat = {
		name: 'Chat4',
		id: 4
	};
	let chat5: Chat = {
		name: 'Chat5',
		id: 5
	};
	let chat6: Chat = {
		name: 'Chat6',
		id: 6
	};
	let chat_list = [chat1, chat2, chat3, chat4, chat5, chat6];

	function handleClick(chat: Chat) {
		$page.params.chat == '/messages/room';
		console.log(`no more alerts ${chat.id}`);
	}
</script>

<div>
	<h1 class="p-10">Groups</h1>
	<div class="row">
		{#each chat_list as chat}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<a href="/messages/{chat.name}">
				<div class="card" on:click={() => handleClick(chat)}>
					<div class="container">
						<h2>{chat.name}</h2>
					</div>
				</div></a
			>
		{/each}
	</div>
</div>

<style>
	.row {
		margin-top: 10px;
		margin-left: 40px;
		margin-right: 40px;
	}
	.card {
		box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
		transition: 0.3s;
		margin-bottom: 10px;
	}

	.card:hover {
		box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
	}

	.container {
		padding: 2px 16px;
	}
</style>
