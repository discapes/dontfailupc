<script>
	import Fa from 'svelte-fa';
	import { faCheck, faCheckDouble } from '@fortawesome/free-solid-svg-icons';

	export let nameChatPartner = 'manolo';
	/**
	 * @type {string}
	 */
	export let nameMe;
	/**
	 * @type {string}
	 */
	export let message;

	/**
	 * @type {any}
	 */
	export let profilePic;
</script>

<div
	class="direct-chat-msg"
	class:right={nameMe == nameChatPartner}
	class:left={nameMe != nameChatPartner}
>
	<div
		class="direct-chat-timestamp"
		class:float-left={nameMe == nameChatPartner}
		class:float-right={nameMe != nameChatPartner}
	>
		<hi>HOLA</hi>
	</div>
	<img class="direct-chat-img" src={profilePic} alt="pic" />
	<div class="direct-chat-text">
		<div class="d-flex">
			<span class="mr-auto">{message}</span>
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
		background: #d2d6de;
		border: 1px solid #d2d6de;
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
		border-right-color: #d2d6de;
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

	.direct-chat-timestamp {
		margin-left: 50px;
		margin-right: 50px;
		color: black;

		margin-bottom: 0;
	}
</style>
