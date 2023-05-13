<script lang="ts">
	import { browser } from '$app/environment';
	import type { Note } from '$lib/course';
	import { flip } from 'svelte/animate';
	import type { ActionData, PageData } from './$types';
	import { enhance } from '$app/forms';
	import Fa from 'svelte-fa';
	import { faStar } from '@fortawesome/free-regular-svg-icons';
	import { faPen, faPlus, faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
	import { page } from '$app/stores';
	import { getNoteUrl } from '$lib/url';
	import { emailShort } from '$lib/util';

	export let data: PageData;
	export let form: ActionData;
	$: ({ favorites, user, course, notes } = data); // REMEMBER

	$: browser && form?.msg && alert(form.msg);

	function sortNotes(a: (typeof notes)[0], b: (typeof notes)[0]) {
		let one = +favorites.includes(b._id) - +favorites.includes(a._id);
		if (one == 0) return a._id.localeCompare(b._id);
		else return one;
	}

	$: mine = notes.find((n) => n.own);
</script>

<main class="p-10">
	<h1>Notes</h1>
	<h2>{course.name}</h2>
	<ul class="flex flex-col gap-1 max-w-xs overflow-hidden">
		{#if mine}
			<a
				href={getNoteUrl($page.params.slug, mine._id, true)}
				class="bg-sky-600 p-3 flex center gap-3 h-10 w-full"><Fa icon={faPen} />Edit</a
			>
		{:else}
			<form method="POST" class="contents" action="?/create">
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
					href={getNoteUrl($page.params.slug, note._id)}
					class="bg-sky-600 p-3 center justify-start w-full h-10 {note.own && 'font-bold'}"
				>
					{note.email ? emailShort(note.email) : note._id}
				</a>
			</li>
		{/each}
	</ul>
</main>
