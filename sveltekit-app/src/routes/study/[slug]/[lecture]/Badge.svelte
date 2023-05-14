<script lang="ts">
	export let percent: number;

	const colors = [
		'bg-red-500/100 outline-red-800',
		'bg-orange-500/100 outline-orange-800',
		'bg-yellow-500/100 outline-yellow-800',
		'bg-lime-500/100 outline-lime-800',
		'bg-green-500/100 outline-green-800'
	];
</script>

{#if percent > 100 || percent < 0 || isNaN(percent)}
	<span class="{colors[0]} outline px-1 outline-1 rounded">X</span>
{:else}
	<span class="{colors[Math.floor(percent / 20)]} outline px-1 outline-1 rounded">{percent}</span>
{/if}
