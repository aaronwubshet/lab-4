
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
  
  let localStorage = globalThis.localStorage ?? {};
  $: localStorage.colorScheme = colorScheme;
  let colorScheme = "light dark";
  if (localStorage.colorScheme) {
	  colorScheme = localStorage.colorScheme;
    }

  let root = globalThis?.document?.documentElement;

  $: root?.style.setProperty("color-scheme", colorScheme);

</script>

<nav>
	{#each pages as p }
        <a href={ p.url } target={ p.url.startsWith("http") ? "_blank" : null } class:current={ "." + $page.route.id === p.url }>{ p.title }  </a>
	{/each}
</nav>

<label class="color-scheme-button">
  Theme:
  
  <select bind:value={ colorScheme }>
      <option value="light dark">Automatic</option>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
  </select>
</label>`


<style>
.color-scheme-button {
  position: absolute;
  top: 1em;
  right: 1em;
  font-size: 80%;
  font-family: inherit;
}
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
