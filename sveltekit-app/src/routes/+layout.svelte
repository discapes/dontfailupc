<script lang="ts">
	import './app.css';
	import Footer from './Footer.svelte';
</script>

<div class="bg-sky-500 min-h-screen overflow-hidden flex flex-col text-white">
	<script>
		if (window?.location?.hash?.startsWith('#access_token')) {
			document.cookie = window.location.hash.slice(1, window.location.hash.indexOf('&'));
			window.location.href = window.location.href.slice(0, window.location.href.indexOf('#'));
		}
	</script>
	<div class="grow flex flex-col">
		<slot />
	</div>
	<Footer />
</div>
