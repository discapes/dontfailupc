<script lang="ts">
	import { enhance } from '$app/forms';
	import { faSave } from '@fortawesome/free-solid-svg-icons';
	import Button from '../../lib/components/Button.svelte';
	import type { Course } from '$lib/types';

	export let editingCourse: Partial<Course> | null;
	export let text = '';

	$: editingCourse && onChange(editingCourse);

	function onChange(editingCourse: Partial<Course>) {
		text = JSON.stringify(editingCourse, null, 2);
	}
</script>

{#if editingCourse}
	<form
		use:enhance={() =>
			({ update, result }) => (
				(editingCourse = result.type == 'success' ? null : editingCourse), update()
			)}
		method="POST"
		action="?/upsert"
		class="modal center"
	>
		<div class="flex flex-col gap-5 p-8 bg-white rounded relative text-black">
			<button
				type="button"
				on:click={() => (editingCourse = null)}
				class="absolute text-black right-3 top-3 text-2xl leading-[15px]">&times;</button
			>
			<textarea bind:value={text} class="outline-1 outline rounded p-2 h-80" name="json" />
			<Button color={'bg-gray-400'} text="Submit" icon={faSave} type="submit" />
		</div>
	</form>
{/if}

<style>
	textarea {
		border: none;
		overflow: auto;
		outline: none;
	}
</style>
