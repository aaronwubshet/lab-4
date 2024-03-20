<script>

        import projects from '$lib/projects.json';
        import Project from "$lib/Project.svelte";
        import Pie from "$lib/Pie.svelte";
        import * as d3 from "d3";
        

        let query = "";

        let filteredProjects;
        $: filteredProjects = projects.filter((project) => {
                let values = Object.values(project).join("\n").toLowerCase();
                return values.includes(query.toLowerCase());
        });

        
        
        let rolledData; 
        $: rolledData = d3.rollups(
                filteredProjects,
                (v) => v.length,
                (d) => d.year
                );
        let pieData
        $: pieData = rolledData.map(([year, count]) => {
                return { value: count, label: year };
        });

        let selectedYearIndex = -1;

        let selectedYear
        $: selectedYear = selectedYearIndex > -1 ? pieData[selectedYearIndex].label : null;

        let filteredByYear;
        $: filteredByYear = projects.filter((project) => {

                if (selectedYear) {
                return project.year === selectedYear;
                }

                return true;
                });


</script>

<svelte:head>
	<title>Projects</title>
</svelte:head>


<Pie data="{pieData}" bind:selectedIndex="{selectedYearIndex}" />



<input class="search"
        type="search"
        bind:value="{query}"
        aria-label="Search projects"
        placeholder="🔍 Search projects…"
/>

<h1>{filteredByYear.length} Projects </h1>
        <div class = "projects">
            {#each filteredByYear as p}
                    <Project info={p} hLevel=1 />
            {/each}
        </div>

<style>
        .search {
                width: 100%;
                font-size: 3em;

        }
        

</style>

