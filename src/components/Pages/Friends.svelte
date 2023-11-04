<script>
    import { fade, slide, blur } from 'svelte/transition';
    import {quintOut} from 'svelte/easing';
    import { FriendsList } from '../../store/stores';
    import Friend from '../Friend.svelte';
</script>

<section>
    {#each $FriendsList as friend }
        <div><Friend {friend} /></div>
    {/each}
</section>

<style>
    section{
        display: flex;
        flex-direction: column;
        gap: 6px;
        overflow-y: scroll;
        transition: all .3s ease;
        padding-bottom: 15px;
        height: 478px;
        overflow-y: scroll;
    }
</style>