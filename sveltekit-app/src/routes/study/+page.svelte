<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import type { Course } from '$lib/course';
	import { faStar } from '@fortawesome/free-regular-svg-icons';
	import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { flip } from 'svelte/animate';
	import type { ActionData, PageData } from './$types';
	import { getCourseUrl } from '$lib/url';

	export let data: PageData;
	export let form: ActionData;
	$: ({ courses, user } = data); // REMEMBER
	$: favorites = user?.favorites ?? [];

	$: browser && form?.msg && alert(form.msg);

	function sortCourses(a: Course, b: Course) {
		let one = +favorites.includes(b._id) - +favorites.includes(a._id);
		if (one == 0) return a.name.localeCompare(b.name);
		else return one;
	}
</script>

<main class="p-10">
	<h1>Study...</h1>
	<h2>Courses:</h2>
	<ul class="flex flex-col gap-1 max-w-xs">
		{#each courses.sort(sortCourses) as course (course._id)}
			<li animate:flip class="flex items-center justify-stretch gap-1">
				<form
					class="contents"
					action="?/{favorites.includes(course._id) ? 'unfavorite' : 'favorite'}"
					use:enhance
					method="POST"
				>
					<button
						name="id"
						class="bg-sky-600 w-10 h-10 center shrink-0"
						value={course._id}
						type="submit"
					>
						<Fa icon={favorites.includes(course._id) ? faStarSolid : faStar} /></button
					>
				</form>
				<a href={getCourseUrl(course.slug)} class="bg-sky-600 p-3 center justify-start grow h-10">
					{course.name}
				</a>
			</li>
		{/each}
	</ul>
</main>
