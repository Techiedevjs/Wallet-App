<script>
    import { ActiveTab, checkDetail } from "./store/stores";
    import { slide, scale, fade } from "svelte/transition";
    import { quintOut } from "svelte/easing";

    import PhoneDetail from "./components/PhoneDetail.svelte";
    import Header from "./components/Header.svelte";
    import Menu from "./components/Menu.svelte";
    // Pages
    import Home from "./components/Pages/Home.svelte";
    import Friends from "./components/Pages/Friends.svelte";
    import Cards from "./components/Pages/Cards.svelte";
    import Transfer from "./components/Pages/Transfer.svelte";
    import Popup from "./components/shared/Popup.svelte";
</script>

<main class="app">
    <div>
        <!-- <PhoneDetail/> -->
        <Header/>
        <section> 
            {#if $ActiveTab === 'your wallet'}
                <Home/>
                {:else if $ActiveTab === 'your friends' }
                <Friends/>
                {:else if $ActiveTab === 'your cards'}
                <Cards/>
                {:else if $ActiveTab === 'transfer'}
                <Transfer/>
            {/if}
        </section>
        <Menu/>
    </div>
    {#if $checkDetail}
        <Popup/>
    {/if}  
</main>

<style>
    main {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%) !important;
        /* height: 92vh; */
        height: 651px;
        aspect-ratio: 298/651;
        background: url('/static/screen.png');
        background-repeat: no-repeat;
        background-size: cover;
        border-radius: 33.6px;
        font-family: "SF Pro Text";
        font-style: normal;
        color: #ffffff;
        overflow: hidden;
    }
    section{
        position: relative;
    }
    main div{
        position: relative;
        height: 100%;
        padding: 0 15px;
    }
</style>
