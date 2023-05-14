<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { getNoteUrl } from '$lib/url';
	import { emailShort } from '$lib/util';
	import { faStar } from '@fortawesome/free-regular-svg-icons';
	import { faPen, faPlus, faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { flip } from 'svelte/animate';
	import type { ActionData, PageData, SubmitFunction } from './$types';
	import Badge from './Badge.svelte';

	export let data: PageData;
	export let form: ActionData;
	$: ({ favorites, lecture, notes } = data); // REMEMBER

	$: browser && form?.msg && alert(form.msg);

	function sortNotes(a: (typeof notes)[0], b: (typeof notes)[0]) {
		let one = +favorites.includes(b._id) - +favorites.includes(a._id);
		if (one != 0) return one;
		if (!a.diff && b.diff) return 1;
		if (!b.diff && a.diff) return 0;
		if (a.diff && b.diff) return a.diff - b.diff;
		else return a._id.localeCompare(b._id);
	}

	const setSource: SubmitFunction = ({ data, cancel }) => {
		const source = prompt('Paste the raw text for the topic ' + lecture.topic);
		if (!source || !source.length) cancel();
		else data.append('source', source);
	};

	$: mine = notes.find((n) => n.own);
</script>

<main class="p-10">
	<h1>{lecture.topic} - {lecture.datestamp}</h1>
	<h2>Ranked notes:</h2>
	<ul class="flex flex-col gap-1 max-w-xs overflow-hidden mb-5">
		{#if mine}
			<a
				href={getNoteUrl($page.params.slug, $page.params.lecture, mine._id, true)}
				class="bg-sky-600 p-3 flex center gap-3 h-10 w-full"><Fa icon={faPen} />Edit</a
			>
		{:else}
			<form use:enhance method="POST" class="contents" action="?/create">
				<button type="submit" class="bg-sky-600 p-3 flex center gap-3 h-10 w-full"
					><Fa icon={faPlus} />New</button
				>
			</form>
		{/if}
		{#each notes.sort(sortNotes) as note (note._id)}
			<li animate:flip class="flex items-center justify-stretch gap-1">
				<form
					class="contents"
					action="?/{favorites.includes(note._id) ? 'unfavorite' : 'favorite'}"
					use:enhance
					method="POST"
				>
					<button
						name="id"
						class="bg-sky-600 w-10 h-10 center shrink-0"
						value={note._id}
						type="submit"
					>
						<Fa icon={favorites.includes(note._id) ? faStarSolid : faStar} /></button
					>
				</form>
				<a
					href={getNoteUrl($page.params.slug, $page.params.lecture, note._id)}
					class="bg-sky-600 p-3 center justify-start gap-3 w-full h-10 {note.own && 'font-bold'}"
				>
					{#if note.score}
						<Badge percent={note.score} />
					{/if}
					<span> {note.email ? emailShort(note.email) : note._id.slice(0, 10)}</span>
				</a>
			</li>
		{/each}
	</ul>
	{#if data.auth?.app_metadata.admin}
		<h2>Source:</h2>
		<form use:enhance={setSource} method="POST" class="contents" action="?/setSource">
			<button type="submit" class="bg-sky-600 p-3 flex center gap-3 h-10 w-full"
				><Fa icon={faPen} />Set source text</button
			>
		</form>
	{/if}
</main>
