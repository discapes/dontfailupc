<script lang="ts">
	import { faRightFromBracket, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
	import Button from '$lib/components/Button.svelte';
	import { AUTH0_CLIENT_ID, AUTH0_DOMAIN } from '../lib/config';
	import type { PageData } from './$types';

	export let data: PageData;

	function login() {
		const nonce = window.crypto.randomUUID();
		document.cookie = `nonce=${nonce}`;

		window.location.assign(
			AUTH0_DOMAIN +
				`/authorize?` +
				new URLSearchParams({
					response_type: 'id_token',
					client_id: AUTH0_CLIENT_ID,
					redirect_uri: window.location.href,
					scope: 'openid profile email',
					nonce
				})
		);
	}
	async function logout() {
		document.cookie = 'id_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
		window.location.assign(
			AUTH0_DOMAIN +
				`/v2/logout?` +
				new URLSearchParams({
					returnTo: window.location.href,
					client_id: AUTH0_CLIENT_ID
				})
		);
	}
</script>

<div class="p-10 grow relative flex justify-center flex-col items-center gap-5">
	<img src="icon.png" alt="background" />

	<script>
		if (window?.location?.hash?.startsWith('#id_token')) {
			const params = new URLSearchParams(window.location.hash.slice(1));
			console.log(...params.entries());
			document.cookie = `id_token=${params.get('id_token')}`;
			window.location.href = window.location.href.split('#')[0];
		}
	</script>
	{#if data.auth}
		<img src={data.auth.picture} class="w-20 h-20" alt="profile" />
		<h2>Hello {data.auth.nickname}.</h2>
		<div class="btn">
			<Button text="Sign out" clazz="p-3" onClick={logout} icon={faRightFromBracket} />
		</div>
	{:else}
		<div class="btn">
			<Button text="Sign in" clazz="p-3" onClick={login} icon={faRightToBracket} />
		</div>
	{/if}
</div>

<style>
	.btn {
		margin-top: 60%;
	}
</style>
