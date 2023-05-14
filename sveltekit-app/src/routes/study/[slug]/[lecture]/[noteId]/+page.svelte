<script lang="ts">
	import { page } from '$app/stores';
	import { faEye, faPen, faSave } from '@fortawesome/free-solid-svg-icons';
	import Button from '$lib/components/Button.svelte';
	import type { PageData } from './$types';
	import Badge from '../Badge.svelte';
	import { enhance } from '$app/forms';

	export let data: PageData;
	$: ({ anonymous, own, score, reason, diff } = data);

	let { text } = data;
	function onDataChange(_: unknown) {
		text = data.text;
	}
	$: onDataChange(data);

	$: noteEditor = new URLSearchParams($page.url.search).has('edit') && own;
</script>

<main class="p-10">
	<h1>Note {noteEditor ? 'Editor' : 'Viewer'}</h1>
	<div class="flex flex-col gap-3">
		{#if diff}
			Keyword difference: {diff}
		{/if}
		{#if score && reason}
			<div>
				GPT review:
				<Badge percent={score} /> -
				{reason}
			</div>
		{/if}
		{#if noteEditor}
			<form use:enhance method="post" class="contents" action="?/save">
				<textarea
					bind:value={text}
					class="outline-1 outline-white w-full bg-sky-600 outline rounded p-2 h-80"
					name="text"
				/>
				<div class="flex gap-3 items-center">
					<input
						bind:checked={anonymous}
						id="anonymous"
						class="bg-sky-600 w-8 h-8 rounded"
						type="checkbox"
						name="anonymous"
					/>
					<p class="text-bold text-xl">Share anonymously</p>
				</div>
				<div class="flex gap-3">
					<Button clazz="grow w-0" text="Submit" icon={faSave} type="submit" />
					<Button
						clazz="grow w-0"
						text="View"
						icon={faEye}
						onClick={(e) => (e.preventDefault(), (noteEditor = false))}
					/>
				</div>
			</form>
		{:else}
			{#if own}
				<Button clazz="grow" text="Edit" icon={faPen} onClick={() => (noteEditor = true)} />
			{/if}
			<div class="outline outline-1 outline-white rounded p-5">{text}</div>
		{/if}
	</div>
</main>
