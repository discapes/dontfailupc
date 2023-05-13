<script lang="ts">
	import { faDoorOpen } from '@fortawesome/free-solid-svg-icons';
	import { faRightToBracket, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
	import type { PageData } from './$types';
	import Button from './Button.svelte';
	import { AUTH0_CLIENT_ID, AUTH0_DOMAIN } from '../lib/config';

	export let data: PageData;

	function login() {
		window.location.assign(
			AUTH0_DOMAIN +
				`/authorize?` +
				new URLSearchParams({
					response_type: 'token',
					client_id: AUTH0_CLIENT_ID,
					redirect_uri: window.location.href,
					scope: 'openid profile email'
				}).toString()
		);
	}
	function logout() {
		document.cookie = 'access_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
		window.location.assign(
			AUTH0_DOMAIN +
				`/v2/logout?` +
				new URLSearchParams({
					returnTo: window.location.href,
					client_id: AUTH0_CLIENT_ID
				}).toString()
		);
	}
</script>

<div class="p-10 grow flex justify-center flex-col items-center gap-5">
	{#if data.userInfo}
		<img src={data.userInfo.picture} class="w-20 h-20" alt="profile" />
		<h2>Hello {data.userInfo.nickname}.</h2>
		<Button text="Logout" onClick={logout} icon={faRightFromBracket} />
	{:else}
		<Button text="Login" onClick={login} icon={faRightToBracket} />
	{/if}
</div>
