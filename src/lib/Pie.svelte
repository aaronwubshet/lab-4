<script>
    import * as d3 from "d3";
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

    
    export let data = [];



    
    
    let sliceGenerator = d3.pie().value((d) => d.value);

    $: arcData = sliceGenerator(data);
    $: arcs = arcData.map((d) => arcGenerator(d));

    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    export let selectedIndex = -1;
    


</script>

<div class="container">
<svg viewBox="-50 -50 100 100">
    {#each arcs as arc, i}
        <path 
        d="{arc}" 
        fill={colors(i)}
        class:selected={selectedIndex === i}
        on:click={e => selectedIndex = selectedIndex === i ? -1 : i}    
        />
    {/each}
    
</svg>


    <ul class="legend">
        {#each data as d, index}
            <li style="--color: { colors(index) }">
                <span class="swatch">  </span>
                {d.label} <em>({d.value})</em>
            </li>
        {/each}
    </ul>
</div>
  
<style>
    .selected {
        --color: oklch(60% 45% 0) !important;

        &:is(path) {
            fill: var(--color);
        }
    }

    .container{
        display: flex;
        gap: 1em;
    }
    svg {
        max-width: 20em;
        margin-block: 2em;

        /* Do not clip shapes outside the viewBox */
        overflow: visible;
    }
    svg:has(path:hover) {
        path:not(:hover) {
            opacity: 50%;
        }
    }
    path {
        transition: 300ms;
        cursor: pointer;
    }

    .swatch{
        width: 1em;
        height: 1em;
        display: inline-block;
        background-color: var(--color);
        border-radius: 25%;
    }

    .legend{
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(9em, 1fr));
        /* gap: 3em; */
        min-width: 5em;
        border-color: darkgray;
        border-width: 2px;
        border-style: solid;
        /* padding: 1em; */
        flex: 1;
    }

    li{
        display: flex;
        align-items: center;
        gap:1em;
    }
</style>

