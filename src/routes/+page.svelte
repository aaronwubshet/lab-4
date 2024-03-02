
<script>
	import projects from '$lib/projects.json';
	import Project from "$lib/Project.svelte";
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<h1>Aaron Wubshet</h1>
<p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad iste deserunt facilis amet, ipsa impedit sunt quisquam, fuga est, explicabo quia at! Nostrum maxime molestiae dolorum doloremque qui fugiat! Nobis! Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sit deleniti necessitatibus dignissimos nemo incidunt? Inventore quas adipisci ipsum nulla, eum officiis doloribus vitae labore distinctio accusantium totam iusto dignissimos cumque. Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil magni, ducimus sed minima natus minus, nemo nobis quam quasi veritatis quisquam officia quos fugit. Non libero dolor labore recusandae quaerat.</p>
<img src="images/aaron.jpeg" alt="Aaron Wubshet" style = "width: 50%; height: 50%"/>

<h2>Selected Projects</h2>
	{#each projects.slice(0,3) as p}
		<div class = "projects">
			<Project info={p} hLevel=4 />
		</div>
	{/each}

