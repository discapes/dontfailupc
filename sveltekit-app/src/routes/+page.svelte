<script lang="ts">
	import './app.css';
	import Fa from 'svelte-fa';
	import { faHouse, faLightbulb, faMessage } from '@fortawesome/free-solid-svg-icons';
</script>

<div class="bg-sky-400 min-h-screen overflow-auto flex flex-col">
	<div class="grow p-10">main body</div>
	<div class="bg-sky-600 p-5 flex justify-evenly gap-10">
		<Fa size="2x" color="white" icon={faLightbulb} />
		<Fa size="2x" color="white" icon={faMessage} />
		<Fa size="2x" color="white" icon={faHouse} />
	</div>
</div>
