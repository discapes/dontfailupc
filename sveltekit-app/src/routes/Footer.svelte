<script lang="ts">
	import Fa from 'svelte-fa';
	import {
		faHouse,
		faLightbulb,
		faMessage,
		faToolbox,
		type IconDefinition
	} from '@fortawesome/free-solid-svg-icons';
	import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
	import { page } from '$app/stores';
	import { backBehaviour } from '$lib/url';

	const tabs: [string, IconDefinition][] = [
		['/study', faLightbulb],
		['/', faHouse],
		['/messages', faMessage]
	];
	if ($page.data.auth?.app_metadata.admin) tabs.push(['/admin', faToolbox]);

	function pathCompare(path: string, beginning: string) {
		if (beginning == '/') return path == beginning;
		else return path.startsWith(beginning);
	}

	function getBackUrl(path: string) {
		const match = backBehaviour.find(([regex, replacement]) => path.match(regex));
		if (match) {
			const [regex, replacement] = match;
			return path.replace(regex, replacement);
		} else {
			return '.';
		}
	}
</script>

<div class="bg-sky-700 p-5 flex items-center justify-evenly gap-10">
	{#each tabs as [path, icon]}
		<a href={path}>
			<Fa size={pathCompare($page.url.pathname, path) ? '3x' : '2x'} color="white" {icon} /></a
		>
	{/each}
	<a href={getBackUrl($page.url.pathname)}> <Fa size="2x" color="white" icon={faArrowLeft} /></a>
</div>
