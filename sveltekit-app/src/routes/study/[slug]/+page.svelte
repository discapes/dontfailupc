<script lang="ts">
	import { getCourseUrl, getLectureUrl } from '$lib/url';
	import { flip } from 'svelte/animate';
	import type { ActionData, PageData } from './$types';
	import { browser } from '$app/environment';
	import Fa from 'svelte-fa';
	import { faPlus } from '@fortawesome/free-solid-svg-icons';
	import { isoDate } from '$lib/util';

	export let data: PageData;
	export let form: ActionData;
	$: ({ course } = data);

	$: browser && form?.msg && alert(form.msg);
</script>

<main class="p-10">
	<h1>{course.name}</h1>
	<h2>Lectures:</h2>
	<ul class="flex flex-col gap-1 max-w-xs">
		{#if course.lectures.every((l) => l.datestamp != isoDate())}
			<form method="POST" class="contents" action="?/save">
				<button type="submit" class="bg-sky-600 p-3 flex center gap-3 h-10 w-full"
					><Fa icon={faPlus} />New</button
				>
			</form>
		{/if}
		{#each course.lectures.sort( (b, a) => a.datestamp.localeCompare(b.datestamp) ) as lecture (lecture.datestamp)}
			<li animate:flip class="flex items-center justify-stretch gap-1">
				<a
					href={getLectureUrl(course.slug, lecture.datestamp)}
					class="bg-sky-600 p-3 center justify-start grow h-10"
				>
					{lecture.topic} - {lecture.datestamp}
				</a>
			</li>
		{/each}
	</ul>
</main>
