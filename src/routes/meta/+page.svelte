<script>
    import * as d3 from "d3";
    import { onMount } from "svelte";
    import Scatterplot from "./Scatterplot.svelte";
    import FileLines from "./FileLines.svelte";
    import Pie from "$lib/Pie.svelte";
    import {scaleTime } from 'd3';
    import Scrolly from "svelte-scrolly";


    let totalLinesout = 0;
    let workByPeriod = [];
    let maxPeriod = 0;
    let avgDepth = 0;
    let selectedCommits = [];

    let commitProgress = 100;
    let timeScale;

    let data = [];
    let commits = [];
   
    let selectedLines;
    let hasSelection;
    let languageBreakdown;

    
    let flattenedCommits=[];
    $: flattenedCommits = commits.flat();
    let minDate;
    let maxDate;
    $: minDate = d3.min(flattenedCommits, d => new Date(d.datetime));
    $: maxDate = d3.max(flattenedCommits, d => new Date(d.datetime));

    $: timeScale = scaleTime()
            .domain([minDate, maxDate])
            .range([0, 100])
            .nice();

    $: commitMaxTime = timeScale.invert(commitProgress);

    let filteredCommits;
    $: filteredCommits = flattenedCommits.filter(commit => new Date(commit.datetime) <= commitMaxTime);

    let filteredLines;
    $: filteredLines = data.filter(datum => new Date(datum.datetime) <= commitMaxTime);


    $: hasSelection = selectedCommits.length > 0;
    $: selectedLines = (hasSelection ? selectedCommits : commits).flatMap(d => d.lines);
    const format = d3.format(".1~%");
    $: languageBreakdown = d3.rollup(
        selectedLines,
        v => d3.count(v, d => d.line)/ selectedLines.length,
        d => d.type
    );

    $: 
    {
        totalLinesout = filteredCommits && filteredCommits[0] && filteredCommits[0].totalLines;
        avgDepth = d3.mean(filteredLines, d => d.depth);
        workByPeriod = d3.rollups(filteredLines, v => v.length, d => d.datetime.toLocaleString("en", {dayPeriod: "short"}))
        maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];

    }

    let colors = d3.scaleOrdinal(d3.schemeTableau10);
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

        
    });
</script>

<svelte:head>
	<title>Meta</title>
</svelte:head>

<style>

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


    .slider-container {
        display: flex;
        flex-direction: column;
        width: 100%;
    }
    .slider {
        flex: 1;
    }
    .time-display {
        text-align: center;
    }

    :global(body) {
        max-width: min(120ch, 80vw);
    }
</style>

<h1>Meta</h1>
<p> This page contains stats about the code base</p>





<Scrolly bind:progress={ commitProgress }>
    {#each commits as commit, index }
        <p>
            On {commit.datetime.toLocaleString("en", {dateStyle: "full", timeStyle: "short"})},
            I made <a href="{commit.url}" target="_blank">{ index > 0 ? 'another glorious commit' : 'my first commit, and it was glorious' }</a>.
            I edited {commit.totalLines} lines across { d3.rollups(commit.lines, D => D.length, d => d.file).length } files.
            Then I looked over all I had made, and I saw that it was very good.
        </p>
    {/each}
	<svelte:fragment slot="viz">
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
        <Scatterplot commits={filteredCommits} bind:selectedCommits={selectedCommits} colors={colors}/>



        <p>{hasSelection ? selectedCommits.length : "No"} commits selected</p>
        <dl class="stats">
            {#each languageBreakdown as [language, proportion]}
            <dd>{language}: {format(proportion)}</dd>
            {/each}
        </dl>
        
        <Pie data={Array.from(languageBreakdown).map(([language, lines]) => ({label: language, value: Math.floor(lines * selectedLines.length)}))} />
        
    </svelte:fragment>
</Scrolly>


<Scrolly bind:progress={ commitMaxTime } --scrolly-layout="viz-first" --scrolly-viz-width="1.5fr" debounce={1000}>
    {#each commits as commit, index }
        <p>
            On {commit.datetime.toLocaleString("en", {dateStyle: "full", timeStyle: "short"})},
            I made <a href="{commit.url}" target="_blank">{ index > 0 ? 'another glorious commit' : 'my first commit, and it was glorious' }</a>.
            I edited {commit.totalLines} lines across { d3.rollups(commit.lines, D => D.length, d => d.file).length } files.
            Then I looked over all I had made, and I saw that it was very good.
        </p>
    {/each}
	<svelte:fragment slot="viz">
        
        <FileLines colors={colors} lines={filteredLines} />	
    </svelte:fragment>
</Scrolly>