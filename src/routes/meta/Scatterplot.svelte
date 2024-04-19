<script>
    import * as d3 from "d3";
    import { onMount } from "svelte";
    import {
        computePosition,
        autoPlacement,
        offset,
    } from '@floating-ui/dom';

    import { scaleLinear, scaleTime, extent } from 'd3';

    export let commits = [];
    export let selectedCommits = [];

   let hasSelection;


    let commitTooltip;
    let tooltipPosition = {x: 0, y: 0};

    export let selectedLines;

    let width = 1000, height = 600;

    let yScale, xScale;

    let margin = {top: 10, right: 10, bottom: 30, left: 20};
    let xAxis;
    let yAxis;
    let yAxisGridlines;
    let hoveredIndex = -1;
    let dotSizescale;
    let svg;

    let usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left
    };
    usableArea.width = usableArea.right - usableArea.left;
    usableArea.height = usableArea.bottom - usableArea.top;
    
    // let flattenedCommits=[];
    // $: flattenedCommits = commits.flat();
    // let minDate;
    // let maxDate;
    // $: minDate = d3.min(flattenedCommits, d => new Date(d.datetime));
    // $: maxDate = d3.max(flattenedCommits, d => new Date(d.datetime));

    // $: timeScale = scaleTime()
    //         .domain([minDate, maxDate])
    //         .range([0, 100])
    //         .nice();

    // $: commitMaxTime = timeScale.invert(commitProgress);


    async function dotInteraction (index, evt) {
        
        let hoveredDot = evt.target;
        if (evt.type === "mouseenter" || evt.type === "focus") {
            hoveredIndex = index;
            tooltipPosition = await computePosition(hoveredDot, commitTooltip, {
                strategy: "fixed", // because we use position: fixed
                middleware: [
                    offset(5), // spacing from tooltip to dot
                    autoPlacement() // see https://floating-ui.com/docs/autoplacement
                ],
            });

        }
        
        else if (evt.type === "click"|| ((evt.type === "keyup") && (evt.key === "Enter"))  ){
            selectedCommits=[commits[index]];
        }
        else if (evt.type === "mouseleave" || evt.type === "blur") {
            hoveredIndex = -1;
        }
        
    }

    function brushed (evt) {
        let brushSelection = evt.selection;
        selectedCommits = !brushSelection ? [] : commits.filter(commit => {
            let min = {x: brushSelection[0][0], y: brushSelection[0][1]};
            let max = {x: brushSelection[1][0], y: brushSelection[1][1]};
            let x = xScale(commit.date);
            let y = yScale(commit.hourFrac);

            return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
        });
    }

    function isCommitSelected (commit) {
        console.log(selectedCommits);
        return selectedCommits.includes(commit);
    }

    $: xScale = scaleTime()
            .domain(d3.extent(commits, d => d.datetime))
            .range([usableArea.left, usableArea.right])
            .nice();
    $: d3.select(xAxis).call(d3.axisBottom(xScale));

    $: dotSizescale = d3.scaleSqrt()
            .domain(d3.extent(commits, d => d.totalLines))
            .range([2,30]);

    $: yScale = scaleLinear()
        .domain([0, 24])
        .range([usableArea.bottom, usableArea.top]);

    $: hoveredCommit = commits[hoveredIndex] ?? hoveredCommit ?? {};

    $: d3.select(svg).call(d3.brush().on("start brush end", brushed));

    
    

    onMount(async () => {
        
        commits = d3.sort(commits, d => -d.totalLines);
        
        d3.select(yAxis).call(d3.axisLeft(yScale).tickFormat(d => String(d % 24).padStart(2, "0") + ":00"));
        d3.select(yAxisGridlines).call(
            d3.axisLeft(yScale)
            .tickFormat("")
            .tickSize(-usableArea.width)
        );
        
    });
</script>

<style>

    @keyframes marching-ants {
        to {
            stroke-dashoffset: -8; /* 5 + 3 */
        }
    }

    svg :global(.selection) {
        fill-opacity: 10%;
        stroke: black;
        stroke-opacity: 70%;
        stroke-dasharray: 5 3;
        animation: marching-ants 2s linear infinite;
    }

    .gridlines {
        stroke-opacity: .2;
    }

    svg {
		overflow: visible;
	}



    dl.info {
		display: grid;
		grid-template-columns: auto;
		margin: 0;
		gap: 0.5em;
		transition-duration: 500ms;
		transition-property: opacity, visibility;
		&[hidden]:not(:hover, :focus-within) {
			opacity: 0;
			visibility: hidden;
		}
	}

	dl.info dt {
		color: #888;
		font-weight: normal;
	}

	dl.info dd {
		margin-left: 0;
		font-weight: bold;
	}

	.tooltip {
		position: fixed;
		top: 1em;
		right: 1em;
		background-color: hsla(100, 0%, 100%, 0.8);
		padding: 1em;
		border-radius: 5px;
		box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.15);
		backdrop-filter: blur(10px);
	}
	circle {
		transition: 200ms;
		transform-origin: center;
		transform-box: fill-box;
		&:hover {
			transform: scale(1.5);

		}
	}
    .selected {
        stroke: black;
        stroke-width: 2;
        fill: red;
    }
    @starting-style {
	    r: 0;
    }
</style>

<dl id="commit-tooltip" class="info tooltip" hidden={hoveredIndex === -1} bind:this={commitTooltip} style="top: {tooltipPosition.y}px; left: {tooltipPosition.x}px">
	<dt>Commit</dt>
	<dd><a href="{ hoveredCommit.url }" target="_blank">{ hoveredCommit.id }</a></dd>

	<dt>Date</dt>
	<dd>{ hoveredCommit.datetime?.toLocaleString("en", {date: "full"}) }</dd>

    <dt>Author</dt>
	<dd>{ hoveredCommit.author }</dd>

    <dt>Lines Editted</dt>
	<dd>{hoveredCommit.totalLines}</dd>

    
	
</dl>

<svg viewBox="0 0 {width} {height}">
    <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis} />
    <g transform="translate({usableArea.left}, 0)" bind:this={yAxis} />
    <g bind:this={svg} />
    <g class="gridlines" transform="translate({usableArea.left}, 0)" bind:this={yAxisGridlines} />
    <g class="dots">
        {#each commits as commit, index (commit.id) }
            <g
                tabindex="0"
                role="button"
                aria-describedby="commit-tooltip"
                on:click={evt => dotInteraction(index, evt)}
                on:keyup={evt => dotInteraction(index, evt)}
                on:mouseenter={evt => dotInteraction(index, evt)}
                on:mouseleave={evt => dotInteraction(index, evt)}
                on:focus={evt => dotInteraction(index, evt)}
                on:blur={evt => dotInteraction(index, evt)}
            >
                <circle
                    cx={ xScale(commit.datetime) }
                    cy={ yScale(commit.hourFrac) }
                    r={dotSizescale(commit.totalLines)}
                    fill='steelblue'
                    fill-opacity={commit === hoveredCommit ? 1 : 0.6}
                    class:selected={isCommitSelected(commit)}
                />
            </g>
        {/each}
    </g>
    
    
</svg>