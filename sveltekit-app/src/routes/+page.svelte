<script lang="ts">
	import { faRightToBracket, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
	import type { PageData } from './$types';
	import Button from './Button.svelte';
	import { AUTH0_CLIENT_ID, AUTH0_DOMAIN } from '../lib/config';

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

<div class="p-10 grow flex justify-center flex-col items-center gap-5">
	<script>
		if (window?.location?.hash?.startsWith('#id_token')) {
			const params = new URLSearchParams(window.location.hash.slice(1));
			console.log(...params.entries());
			document.cookie = `id_token=${params.get('id_token')}`;
			window.location.href = window.location.href.slice(0, window.location.href.indexOf('#'));
		}
	</script>
	{#if data.userInfo}
		<img src={data.userInfo.picture} class="w-20 h-20" alt="profile" />
		<h2>Hello {data.userInfo.nickname}.</h2>
		<Button text="Logout" onClick={logout} icon={faRightFromBracket} />
	{:else}
		<Button text="Login" onClick={login} icon={faRightToBracket} />
	{/if}
</div>
