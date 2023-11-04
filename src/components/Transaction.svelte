<script>
    import { Detail, checkDetail} from "../store/stores"
    export let transaction;
    const handleClick = () => {
        checkDetail.set(true)
        Detail.set({
        iban: transaction.iban,
        name: transaction.name,
        info: transaction.detail,
        date: transaction.date,
        amount: transaction.amount,
        type: transaction.type
        })
  }
</script>

<div class="transaction" on:click={handleClick} on:keydown={() => {}}>
    <p class="name">{transaction.name}</p>
    <p class="amount {transaction.type === 'debit' ? 'negative' : 'positive'}"> {transaction.type === 'debit' ? '- ' : '+ '} {transaction.amount} USD</p>
</div>

<style>
    .transaction{
        transition: all .3s ease;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.04);
        padding: 13px 19px 13px 17px;
        display: flex;
        justify-content: space-between;
        cursor: pointer;
        font-family: Outfit;
        font-size: var(--fs);
        font-style: normal;
        font-weight: 600;
        line-height: normal;
    }
    .transaction:hover{
        background: rgba(255, 255, 255, 0.10);
    }
    .name{
        color: #578CFF;
        text-transform: capitalize;
    }
</style>