<script>
    import * as d3 from "d3";
    import { scale } from 'svelte/transition';
    import {
        computePosition,
        autoPlacement,
        offset,
    } from '@floating-ui/dom';
    import { scaleTime, scaleLinear, extent } from 'd3';
    import { flip as originalFlip } from "svelte/animate";


    export let lines=[];

    let files = [];
    $: {
        files = d3.groups(lines, d => d.file).map(([name, lines]) => {
            return {name, lines};
        });
        files = d3.sort(files, d => -d.lines.length);

    }
    export let colors = d3.scaleOrdinal(d3.schemeTableau10);

    function getFlip () {
    	return originalFlip;
    }
    $: flip = getFlip(files);

</script>
    
<style>
    dl > div {
        grid-column: 1 / -1;
        display: grid;
        grid-template-columns: subgrid;
    }

    dt {
        grid-column: 1;
    }

    dd {
        grid-column: 2;
    }
    .small{
        display: block
    }
    .line {
        display: flex;
        width: .5em;
        aspect-ratio: 1;
        background: var(--color);
        border-radius: 50%;
    }
    dd {
        grid-column: 2;
        display: flex;
        flex-wrap: wrap;
        align-items: start;
        align-content: start;
        gap: .15em;
        padding-top: .6em;
        margin-left: 0;
    }

</style>

<dl class="files">
	{#each files as file (file.name) }
		<div>
			<dt>
				<code>{file.name}</code>
                <div class="small">{file.lines.length} lines</div>
			</dt>
			<dd>
                {#each file.lines as line (line.line) }
                    <div animate:flip={{duration: 500, delay: 0}} in:scale class="line" style="--color: { colors(line.type) }"></div>                {/each}
            </dd>
		</div>
	{/each}
</dl>
