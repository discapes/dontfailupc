<script lang="ts">
	import type { Message } from '$lib/types';
	import { emailShort } from '$lib/util';

	export let message: Message;
	export let pic: string;
	export let right: boolean;
	$: ({ timestamp } = message);
</script>

<div class="direct-chat-msg" class:right class:left={!right}>
	<div class="direct-chat-infos clearfix">
		<span class="direct-chat-name" class:float-right={right} class:float-left={!right}
			>{emailShort(message.user)}</span
		>

		<span class="direct-chat-timestamp" class:float-left={right} class:float-right={!right}>
			{#if true}
				{new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
			{:else}
				{new Date(timestamp).toLocaleString([], {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit',
					hour: '2-digit',
					minute: '2-digit',
					hour12: false
				})}
			{/if}
		</span>
	</div>
	<img class="direct-chat-img" src={pic} alt="pic" />
	<div class="direct-chat-text">
		<div class="d-flex">
			<span class="mr-auto">{message.message} </span>
		</div>
	</div>
</div>

<style>
	.direct-chat-msg,
	.direct-chat-text {
		display: block;
	}
	.direct-chat-msg {
		margin-bottom: 10px;
	}
	.direct-chat-msg:before,
	.direct-chat-msg:after {
		content: ' ';
		display: table;
	}
	.direct-chat-msg:after {
		clear: both;
	}
	.direct-chat-text {
		border-radius: 5px;
		position: relative;
		padding: 5px 10px;
		background: rgba(179, 242, 221, 0.7);
		border: 1px solid rgba(179, 242, 221, 0.7);
		margin: 2px 0 5px 50px;
		color: #444;
		margin-right: 50px;
	}
	.direct-chat-text:after,
	.direct-chat-text:before {
		position: absolute;
		right: 100%;
		top: 15px;
		border: solid transparent;
		border-right-color: rgba(179, 242, 221, 0.7);
		content: ' ';
		height: 0;
		width: 0;
		pointer-events: none;
	}
	.direct-chat-text:after {
		border-width: 5px;
		margin-top: -5px;
	}
	.direct-chat-text:before {
		border-width: 6px;
		margin-top: -6px;
	}
	.right .direct-chat-text {
		margin-right: 50px;
		margin-left: 50px;
	}
	.right .direct-chat-text:after,
	.right .direct-chat-text:before {
		right: auto;
		left: 100%;
		border-right-color: transparent;
		border-left-color: #d2d6de;
	}
	img {
		border-radius: 50%;
		float: left;
		width: 40px;
		height: 40px;
	}
	.right img {
		float: right;
	}

	.direct-chat-infos {
		font-size: 0.8rem;
	}
	.direct-chat-name {
		font-weight: 600;
		color: #999;
	}
	.direct-chat-timestamp {
		margin-left: 50px;
		margin-right: 50px;
		color: #999;

		margin-bottom: 0;
	}
</style>
