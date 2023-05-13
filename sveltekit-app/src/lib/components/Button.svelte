<script lang="ts">
	import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	export let text: string;
	export let icon: IconDefinition;
	export let type: 'button' | 'submit' | 'reset' | null | undefined = undefined;
	export let color = 'bg-sky-700 hover:bg-sky-800';
	export let clazz = '';
	export let onClick: (e: Event) => void = () => {};
</script>

<button
	on:click={onClick}
	{type}
	class="{color} {clazz} p-2 rounded text-xl font-bold center gap-3"
>
	<span>{text}</span>
	<Fa {icon} />
</button>
