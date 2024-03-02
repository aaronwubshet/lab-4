

<script>
    export let info = {};
    let p = info;

    export let hLevel = 2;

</script>



<article>
    <svelte:element this={"h" + hLevel}>{ p.title }</svelte:element>
    <img src={p.image} alt="">
    <p>{p.description}</p>
    
</article>

<style>

    .projects {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15em, 1fr));
    }

    article {
    grid-template-rows: subgrid;
    grid-row: span 3;
    }
</style>