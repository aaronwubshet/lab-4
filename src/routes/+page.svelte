
<script>
	import projects from '$lib/projects.json';
	import Project from "$lib/Project.svelte";
	
	let profileData = fetch("https://api.github.com/users/your-username");

	

</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<h1>Aaron Wubshet</h1>
<p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad iste deserunt facilis amet, ipsa impedit sunt quisquam, fuga est, explicabo quia at! Nostrum maxime molestiae dolorum doloremque qui fugiat! Nobis! Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sit deleniti necessitatibus dignissimos nemo incidunt? Inventore quas adipisci ipsum nulla, eum officiis doloribus vitae labore distinctio accusantium totam iusto dignissimos cumque. Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil magni, ducimus sed minima natus minus, nemo nobis quam quasi veritatis quisquam officia quos fugit. Non libero dolor labore recusandae quaerat.</p>
<img src="images/aaron.jpeg" alt="Aaron Wubshet" style = "width: 50%; height: 50%"/>

<h2>Selected Projects</h2>
<div class = "projects">
		{#each projects.slice(0,3) as p}
				<Project info={p} hLevel=3 />
		{/each}
	</div>
<section class = "githubstats">

	<h2>Github Stats</h2>
	{#await fetch("https://api.github.com/users/aaronwubshet") }
	<p>Loading...</p>
	{:then response}
		{#await response.json()}
			<p>Decoding...</p>
		{:then data}
			<dl>
				<dt>Followers:</dt>
					<dd>{data.followers}</dd>
				<dt>Following:</dt>
					<dd>{data.following}</dd>
				<dt>Public Repos:</dt>
					<dd>{data.public_repos}</dd>
				<dt>Public Gists:</dt>
					<dd>{data.public_gists}</dd>
			</dl>
		{:catch error}
			<p class="error">
				Something went wrong: {error.message}
			</p>
		{/await}
	{:catch error}
		<p class="error">
			Something went wrong: {error.message}
		</p>
	{/await}
</section>
