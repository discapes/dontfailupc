<script lang="ts">
	import Fa from 'svelte-fa';
	import { faHouse, faLightbulb, faMessage } from '@fortawesome/free-solid-svg-icons';
	import { page } from '$app/stores';

	const tabs = [
		['/study', faLightbulb],
		['/', faHouse],
		['/messages', faMessage]
	] as const;
</script>

<div class="bg-sky-700 p-5 flex items-center justify-evenly gap-10">
	{#each tabs as [path, icon]}
		<a href={path}> <Fa size={$page.url.pathname == path ? '3x' : '2x'} color="white" {icon} /></a>
	{/each}
</div>
