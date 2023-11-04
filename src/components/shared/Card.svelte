<script>
    import {ActiveCard, ActiveTab} from '../../store/stores';
    import {quintOut} from 'svelte/easing';
    import { fade, slide, scale } from 'svelte/transition';
    export let cardDetail;
    const switchCard = (name) => {
        ActiveCard.set(name)
        ActiveTab.set('your wallet')
    }
</script>

    <div on:click={switchCard(cardDetail.name)} on:keydown={() => {}} class="card {cardDetail.cardColour}" style="background: url(../static/{cardDetail.cardColour}.png); aspect-ratio: 268/153; background-repeat: no-repeat; background-size: cover;">
        <div class="overlay"></div>
        <div class="content">
            <div>
                <p>Your Balance</p>
                <h1>${cardDetail.balance}.00</h1>
            </div>
            <div>
                <p>{cardDetail.cardType}</p>
                <h3>{cardDetail.cardNumber}</h3>
            </div>
        </div>
    </div>

<style>
    .card{
        width: 100%;
        margin-bottom: 10px;
        position: relative;
        border-radius: var(--fm);
        overflow: hidden;
        cursor: pointer;
        transition: all .3s ease;
        height: 153px;
    }
    .card:hover .overlay{
        background-color: rgba(255, 255, 255, 0.2);
    }
    .overlay{
        width: 100%;
        height: 100%;
        position: absolute;
        background-color: rgba(255, 255, 255, 0);
        transition: all .3s ease;
    }
    .content{
        position: absolute;
        z-index: 2;
        width: 100%;
        height: 100%;
        padding:9% 6%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .card h1{
        color: #FFF;
        text-shadow: 0px 0px 60px rgba(255, 255, 255, 0.15);
        font-family: Outfit;
        font-size: var(--fxl);
        font-style: normal;
        font-weight: 500;
        line-height: normal;
        letter-spacing: 2.4px;
        text-transform: uppercase;
    }
    .card h3{
        color: #FFF;
        text-shadow: 0px 0px 60px rgba(255, 255, 255, 0.15);
        font-family: Outfit;
        font-size: var(--fm);
        font-style: normal;
        font-weight: 500;
        line-height: normal;
        letter-spacing: 2.4px;
        text-transform: uppercase;
    }
    .card p{
        color: #A6C9FF;
        text-shadow: 0px 0px 60px rgba(255, 255, 255, 0.15);
        font-family: Outfit;
        font-size: var(--fs);
        font-style: normal;
        font-weight: 500;
        line-height: normal;
        letter-spacing: 0.42px;
        text-transform: capitalize;
    }
    .blue p{
        color: #A6C9FF;
    }
    .yellow p{
        color: #FFF0A4;
    }
    .purple p{
        color: #FFB5F8;
    }
</style>