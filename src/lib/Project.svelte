

<script>
    export let info = {};
    let p = info;

    export let hLevel = 2;

</script>

<article>
    <svelte:element this={"h" + hLevel}>{ p.title }</svelte:element>
    <img src={p.image} alt="TBD">
    <p>{p.description}</p>
    <p class = "date">c. {p.year}</p>
</article>

<style>

    article {
    grid-template-rows: subgrid;
    grid-row: span 3;
    }
    .date {
        font-family: "Baskerville";
        font-variant-numeric: oldstyle-nums;
    }
</style>