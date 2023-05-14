<script lang="ts">
	import { getCourseChatUrl, getCourseUrl, getLectureUrl } from '$lib/url';
	import { flip } from 'svelte/animate';
	import type { ActionData, PageData, SubmitFunction } from './$types';
	import { browser } from '$app/environment';
	import Fa from 'svelte-fa';
	import { faComments, faPlus } from '@fortawesome/free-solid-svg-icons';
	import { isoDate } from '$lib/util';
	import Button from '$lib/components/Button.svelte';
	import { enhance } from '$app/forms';

	export let data: PageData;
	export let form: ActionData;
	$: ({ course } = data);

	$: browser && form?.msg && alert(form.msg);

	const newLecture: SubmitFunction = ({ data, cancel }) => {
		const topic = prompt("Topic for today's lesson?");
		if (!topic || !topic.length) cancel();
		else data.append('topic', topic);
	};
</script>

<main class="p-10">
	<h1>{course.name}</h1>
	<h2>Lectures:</h2>
	<ul class="flex flex-col gap-1 max-w-xs mb-5">
		{#if course.lectures.every((l) => l.datestamp != isoDate())}
			<form use:enhance={newLecture} method="POST" class="contents" action="?/save">
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
	<h2>Chat:</h2>
	<a href={getCourseChatUrl(course.slug)}> <Button text="Join" icon={faComments} /></a>
</main>
