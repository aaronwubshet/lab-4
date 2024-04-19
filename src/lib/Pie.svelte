<script>
    import * as d3 from "d3";
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    import { easeCubic } from 'd3-ease';

    export let data = [];

    let sliceGenerator = d3.pie().value(d => d.value).sort(null);

    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    export let selectedIndex = -1;
    let wedges = {};
    let pieData;
    let oldData = [];

    $: {
        oldData = pieData;
        pieData = data.map(d => ({...d}));
        pieData = d3.sort(data, d => d.label);
        let arcData = sliceGenerator(pieData);
        let arcs = arcData.map((d) => arcGenerator(d));
        pieData = pieData.map((d, i) => ({...d, ...arcData[i], arc: arcs[i]}));
        transitionArcs();

    };
    
    export let transitionDuration = 100;

    
    function transitionArcs() {
        let wedgeElements = Object.values(wedges);

        d3.selectAll(wedgeElements).transition("arc")
            .duration(transitionDuration)
            .styleTween("d", function (_, index) {
                let wedge = this;
                let label = Object.keys(wedges)[index];
                let transition = transitionArc(wedge, label);
                return transition?.interpolator;
            });
    }

    function getEmptyArc (label, data = pieData) {
        // Union of old and new labels in the order they appear
        let labels = d3.sort(new Set([...oldData, ...pieData].map(d => d.label)));
        let labelIndex = labels.indexOf(label);
        let sibling;
        for (let i = labelIndex - 1; i >= 0; i--) {
            sibling = data.find(d => d.label === labels[i]);
            if (sibling) {
                break;
            }
        }

        let angle = sibling?.endAngle ?? 0;
        return {startAngle: angle, endAngle: angle};
    }

    function arc(_, index) {
        let wedge = this;
        let label = Object.keys(wedges)[index];
        let transition = transitionArc(wedge, label);

        // If there's a transition, return a function that prepends "d: " to the interpolator's output
        if (transition) {
            return {
                css: t => `d: ${transition.interpolator(t)}`,
                duration: 100,
                easing: d3.easeLinear
            };
        }

        // If there's no transition, return a function that always returns "d: path(0,0)"
        return {
            css: () => 'd: path(0,0)',
            duration: 100,
            easing: d3.easeLinear
        };
    }
    function transitionArc (wedge, label) {
        label ??= Object.entries(wedges).find(([label, w]) => w === wedge)[0];
        let d = pieData.find(d => d.label === label);
        let d_old = oldData.find(d => d.label === label);
        if (sameArc(d_old, d)) {
            return null;
        }
        let from = d_old ? {...d_old} : getEmptyArc(label, oldData);
        let to = d ? {...d} : getEmptyArc(label,pieData);
        // if (!d || !d_old) {
        //     let from = d_old ? {...d_old} : getEmptyArc(label, oldData);
        //     let to = d ? {...d} : getEmptyArc(label,pieData);
        // }
        // else{
        //     let from = {...d_old};
        //     let to = {...d};
        // }
        
        let angleInterpolator = d3.interpolate(from, to);
        let interpolator = t => `path("${ arcGenerator(angleInterpolator(t)) }")`;
        let type = d ? d_old ? "update" : "in" : "out";
        return {d, d_old, from, to, interpolator, type};
    }

    function sameArc (a, b) {
        return a?.startAngle === b?.startAngle && a?.endAngle === b?.endAngle;
    }

</script>

<div class="container">
    <svg viewBox="-50 -50 100 100">
        {#each pieData as d, i (d.label)}
                <path 
                d={d.arc} 
                fill={ colors(d.label)  }
                class:selected={selectedIndex === i}
                on:click={e => selectedIndex = selectedIndex === i ? -1 : i}
                on:keydown={e => { if (e.key === 'Enter') selectedIndex = selectedIndex === i ? -1 : i }}
                tabindex="0"
                role="button"
                bind:this={ wedges[d.label]}
                transition:arc
            />
        {/each}
    </svg>
    <ul class="legend">
        {#each pieData as d}
            <li style="--color: { colors(d.label) }">
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
        fill-opacity: 75%;
        transition-property: transform, opacity, fill;

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

