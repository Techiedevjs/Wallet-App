<script>
    import {quintOut} from 'svelte/easing';
    import { fade, slide } from 'svelte/transition';
    import { CardsTransactions } from "../../store/stores";
    import Card from "../shared/Card.svelte";
    $:cards = $CardsTransactions
</script>

<section class="cards">
    {#each cards as cardDetail (cardDetail.cardNumber) }
        <Card {cardDetail}/>
    {/each}
</section>

<style>
   .cards{
        display: flex;
        flex-direction: column;
        transition: all .3s ease;
        height: 478px;
        overflow-y: scroll;
    }
</style>