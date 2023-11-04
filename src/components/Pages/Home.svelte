<script>
    import { fade, slide } from 'svelte/transition';
    import {quintOut} from 'svelte/easing'
    import {ActiveCard, CardsTransactions} from '../../store/stores'
    import Transaction from '../Transaction.svelte';
    import Card from '../shared/Card.svelte';
    let currentCard = $CardsTransactions.filter((card) => card.name === $ActiveCard);
</script>

<section>
    <Card  cardDetail={currentCard[0]} />
    <div>
        <p>Last Transactions</p>

        <section class="transactions">
            {#each currentCard[0].transactions as transaction (transaction.id)}
                <Transaction {transaction} />
            {/each}
        </section>
    </div>
</section>

<style>
    p{
        color: #FFF;
        text-overflow: ellipsis;
        font-family: 'SF Pro Text';
        font-size: var(--fm);
        font-style: normal;
        font-weight: 700;
        line-height: normal;
        margin-top: calc(2 * var(--fm));
        margin-bottom: var(--fl);
        transition: all .3s ease;
    }
    .transactions{
        display: flex;
        flex-direction: column;
        gap: 6px;
        height: 248px;
        overflow-y: scroll;
        padding-bottom: 15px;
    }
</style>