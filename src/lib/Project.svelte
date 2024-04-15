<script>
    export let info = {};
    
    export let hLevel = 2;

</script>

<article>
    <svelte:element this={"h" + hLevel}>{ info.title }</svelte:element>
    <img src={info.image} alt="TBD">
    <p>{info.description}</p>
    <p class = "date">c. {info.year}</p>
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