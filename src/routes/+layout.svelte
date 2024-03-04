
<script>
    import "../style.css";
    let pages = [
	{url: "./", title: "Home"},
	{url: "./projects", title: "Projects"},
    {url: "./contact", title: "Contact"},
    {url: "./resumeCV", title: "Resume"},
    {url: "https://github.com/aaronwubshet", title: "Github profile"}
];
    import { page } from '$app/stores';



</script>

<nav>
	{#each pages as p }
        <a href={ p.url } target={ p.url.startsWith("http") ? "_blank" : null } class:current={ "." + $page.route.id === p.url }>{ p.title }  </a>
	{/each}
</nav>

<style>

nav {
  display: flex;
  margin-bottom: 3%;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: oklch(50% 10% 200 / 40%);
}

a:hover{
  padding-bottom: 1%;
  border-bottom-width: .4em;
  border-bottom-style: solid;
  border-bottom-color: var(--color-accent);
  background-color: color-mix(in oklch, var(--color-accent), canvas 85%);
}
</style>

<slot />
