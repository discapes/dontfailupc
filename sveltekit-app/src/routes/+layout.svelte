<script lang="ts">
	import './app.css';
	import Footer from './Footer.svelte';
</script>

<div class="bg-sky-500 min-h-screen overflow-hidden flex flex-col text-white">
	<div class="grow flex flex-col">
		<slot />
	</div>
	<Footer />
</div>
