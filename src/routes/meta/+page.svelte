<script>
    import * as d3 from "d3";

    import { onMount } from "svelte";

    let data = [];
    let commits = [];
    let totalLines = 0;
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


    let usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left
    };
    usableArea.width = usableArea.right - usableArea.left;
    usableArea.height = usableArea.bottom - usableArea.top;
    
    $: hoveredCommit = commits[hoveredIndex] ?? hoveredCommit ?? {};

    $: if (commits.length > 0) {
        yScale = scaleLinear()
        .domain([0, 24])
        .range([usableArea.bottom, usableArea.top]);

        xScale = scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .range([usableArea.left, usableArea.right])
        .nice();

                
            
        d3.select(xAxis).call(d3.axisBottom(xScale));
        d3.select(yAxis).call(d3.axisLeft(yScale).tickFormat(d => String(d % 24).padStart(2, "0") + ":00"));
        d3.select(yAxisGridlines).call(
            d3.axisLeft(yScale)
            .tickFormat("")
            .tickSize(-usableArea.width)
        );

        

    }




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
                totalLines: lines.length
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

        totalLines = commits[0].totalLines;
        avgDepth = d3.mean(data, d => d.depth);
        $: workByPeriod = d3.rollups(data, v => v.length, d => d.datetime.toLocaleString("en", {dayPeriod: "short"}))
        $: maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];

    });



</script>

<svelte:head>
	<title>Meta</title>
</svelte:head>

<style>
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
</style>

<h1>Meta</h1>
<p> This page contains stats about the code base</p>

<dl class="stats">
	<dt>Total <abbr title="Lines of code">LOC</abbr></dt>
	<dd>{data.length}</dd>
    <dt>Lines Editted by Last Commit </dt>
	<dd>{totalLines}</dd>
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


    <g class="gridlines" transform="translate({usableArea.left}, 0)" bind:this={yAxisGridlines} />

    <g class="dots">
        {#each commits as commit, index }
            <circle
                cx={ xScale(commit.datetime) }
                cy={ yScale(commit.hourFrac) }
                r="5"
                fill="steelblue"
    	        on:mouseenter={evt => {
                    hoveredIndex = index;
                    cursor = {x: evt.x, y: evt.y};
                }}
	            on:mouseleave={evt => hoveredIndex = -1}
                
            />
        {/each}
    </g>    
        
</svg>
