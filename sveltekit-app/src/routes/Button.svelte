<script lang="ts">
	import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
	import Fa from 'svelte-fa';

	export let text: string;
	export let icon: IconDefinition;
	export let onClick: () => void;
</script>

<button on:click={onClick} class="bg-sky-700 p-3 rounded text-xl font-bold flex items-center gap-3">
	<span>{text}</span>
	<Fa {icon} />
</button>
