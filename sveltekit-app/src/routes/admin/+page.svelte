<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import { faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';
	import { flip } from 'svelte/animate';
	import type { ActionData, PageData } from './$types';
	import Editor from './Editor.svelte';
	import type { Course } from '$lib/types';

	export let data: PageData;
	export let form: ActionData;

	$: browser && form?.msg && alert(form.msg);

	function sortCourses(a: Course, b: Course) {
		return a.name.localeCompare(b.name);
	}

	let editingCourse: Partial<Course> | null;

	function create() {
		editingCourse = {
			name: '',
			slug: '',
			lectures: []
		};
	}
	function edit(course: Course) {
		editingCourse = course;
	}
</script>

<main class="p-10">
	<Editor bind:editingCourse />
	<h1>Admin</h1>
	<h2>Edit courses:</h2>
	<ul class="flex flex-col gap-1 max-w-xs">
		{#each data.courses.sort(sortCourses) as course (course._id)}
			<li animate:flip class="flex items-center gap-1">
				<button
					on:click={() => edit(course)}
					class="bg-sky-600 w-10 h-10 center shrink-0"
					value={course._id}
				>
					<Fa icon={faPen} /></button
				>
				<p class="bg-sky-600 grow p-3 center justify-start h-10">
					{course.name}
				</p>
				<form class="contents" action="?/delete" use:enhance method="POST">
					<button
						type="submit"
						class="bg-sky-600 w-10 h-10 center shrink-0"
						value={course._id}
						name="id"
					>
						<Fa icon={faTrash} color="#ffaaaa" /></button
					>
				</form>
			</li>
		{/each}
		<button on:click={create} class="bg-sky-600 p-3 flex center gap-3 h-10"
			><Fa icon={faPlus} />New</button
		>
	</ul>
</main>
