<script>
    import * as d3 from "d3";

    import { onMount } from "svelte";

    import Pie from "$lib/Pie.svelte";

    let data = [];
    let commits = [];
    let totalLinesout = 0;
    let workByPeriod = [];
    let maxPeriod = 0;
    let avgDepth = 0;
    let width = 1000, height = 600;
    import { scaleLinear, scaleTime, extent } from 'd3';

    let yScale, xScale;

    let margin = {top: 10, right: 10, bottom: 30, left: 20};
    let xAxis;
    let yAxis;
    let yAxisGridlines;
    let hoveredIndex = -1;
    let cursor = {x: 0, y: 0};
    let dotSizescale;
    let svg;
    let brushSelection;
    let selectedLines;
    let languageBreakdown;


    let usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left
    };
    usableArea.width = usableArea.right - usableArea.left;
    usableArea.height = usableArea.bottom - usableArea.top;
    
    yScale = scaleLinear()
        .domain([0, 24])
        .range([usableArea.bottom, usableArea.top]);

    $: hoveredCommit = commits[hoveredIndex] ?? hoveredCommit ?? {};

   
    $: d3.select(svg).call(d3.brush().on("start brush end", brushed));

    function brushed (evt) {
        brushSelection = evt.selection
    }
    function isCommitSelected (commit) {
        if (!brushSelection) {
            return false;
        }
        let min = {x: brushSelection[0][0], y: brushSelection[0][1]};
        let max = {x: brushSelection[1][0], y: brushSelection[1][1]};
        let x = xScale(commit.date);
        let y = yScale(commit.hourFrac);
        
        return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
    }
    $: selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
    $: hasSelection = brushSelection && selectedCommits.length > 0;
    $: selectedLines = (hasSelection ? selectedCommits : commits).flatMap(d => d.lines);
    const format = d3.format(".1~%");
    $: languageBreakdown = d3.rollup(
        selectedLines,
        v => d3.count(v, d => d.line)/ selectedLines.length,
        d => d.type
    );
    
    

    onMount(async () => {
        data = await d3.csv("loc.csv", row => ({
        ...row,
        line: Number(row.line), // or just +row.line
        depth: Number(row.depth),
        length: Number(row.length),
        date: new Date(row.date + "T00:00" + row.timezone),
        datetime: new Date(row.datetime)
        }) );
        
        commits = d3.groups(data, d => d.commit).map(([commit, lines]) => {
            let first = lines[0];
            let {author, date, time, timezone, datetime} = first;
            let ret = {
                id: commit,
                url: "https://github.com/vis-society/lab-7/commit/" + commit,
                author, date, time, timezone, datetime,
                hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
                totalLines: lines.length,
                language: first.type
            };

            // Like ret.lines = lines
            // but non-enumerable so it doesn’t show up in JSON.stringify
            Object.defineProperty(ret, "lines", {
                value: lines,
                configurable: true,
                writable: true,
                enumerable: false,
            });

            return ret;
        });
        commits = d3.sort(commits, d => -d.totalLines);

        
        xScale = scaleTime()
            .domain(d3.extent(commits, d => d.datetime))
            .range([usableArea.left, usableArea.right])
            .nice();


        dotSizescale = d3.scaleSqrt()
            .domain(d3.extent(commits, d => d.totalLines))
            .range([2,30]);
                
            
        d3.select(xAxis).call(d3.axisBottom(xScale));
        d3.select(yAxis).call(d3.axisLeft(yScale).tickFormat(d => String(d % 24).padStart(2, "0") + ":00"));
        d3.select(yAxisGridlines).call(
            d3.axisLeft(yScale)
            .tickFormat("")
            .tickSize(-usableArea.width)
        );
        

        totalLinesout = commits[0].totalLines;
        avgDepth = d3.mean(data, d => d.depth);
        workByPeriod = d3.rollups(data, v => v.length, d => d.datetime.toLocaleString("en", {dayPeriod: "short"}))
        maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];

        
    });
</script>

<svelte:head>
	<title>Meta</title>
</svelte:head>

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

	dl.stats dt {
		color: #888;
		font-weight: normal;
	}

	dl.stats dd {
		margin-left: 10;
		font-weight: bold;
	}

	.stats {
        display: grid;
        grid-template-columns: auto;
        margin: 0;
        gap: 0.5em;
		background-color: hsla(100, 0%, 100%, 0.8);
		padding: 1em;
		border-radius: 5px;
		box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.15);
		backdrop-filter: blur(10px);
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
</style>

<h1>Meta</h1>
<p> This page contains stats about the code base</p>


<dl class="stats">
	<dt>Total <abbr title="Lines of code">LOC</abbr></dt>
	<dd>{data.length}</dd>
    <dt>Lines Editted by Last Commit </dt>
	<dd>{totalLinesout}</dd>
    <dt>Most commits are done</dt>
	<dd>{maxPeriod}</dd>
    <dt>The average depth is</dt>
	<dd>{avgDepth}</dd>
</dl>
<dl id="commit-tooltip" class="info tooltip" hidden={hoveredIndex === -1} style="top: {cursor.y}px; left: {cursor.x}px">
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
        {#each commits as commit, index }
            <circle
                cx={ xScale(commit.datetime) }
                cy={ yScale(commit.hourFrac) }
                r={dotSizescale(commit.totalLines)}
                fill='steelblue'
                fill-opacity={commit === hoveredCommit ? 1 : 0.6}
                class:selected={isCommitSelected(commit)}
    	        on:mouseenter={evt => {
                    hoveredIndex = index;
                    cursor = {x: evt.x, y: evt.y};
                }}
	            on:mouseleave={evt => hoveredIndex = -1}        
            />
        {/each}
    </g>    
    
    
</svg>
<p>{hasSelection ? selectedCommits.length : "No"} commits selected</p>
<dl class="stats">
    {#each languageBreakdown as [language, proportion]}
      <dd>{language}: {format(proportion)}</dd>
    {/each}
  </dl>

<Pie data={Array.from(languageBreakdown).map(([language, lines]) => ({label: language, value: (lines)*selectedLines.length}))} />