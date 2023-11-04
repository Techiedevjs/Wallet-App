<script>
    import { ActiveTab} from "../store/stores";
    import { createEventDispatcher } from "svelte";
    
</script>

<header>
    <div class="header-content">
        <h4>{$ActiveTab}</h4>
        <div>
            <img src="../static/profile-picture.svg" alt="profile ">
        </div>
    </div>
</header>

<style>
    header {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: end;
        font-size: var(--fm);
        padding:54px 0 15px 0;
        transition: all .3s ease;
    }
    header .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }
    h4{
        text-transform: capitalize;
        font-size: var(--fm);
    }
</style>
