<script>
    import { checkDetail, Detail, ActiveTab } from "../../store/stores";
    import {onMount} from 'svelte'
    import {quintOut} from 'svelte/easing';
    import { fade, slide, scale } from 'svelte/transition';
    let pop = true;
    let opac = true;
    onMount(() => {
        setTimeout(() => {
            pop=false
            opac=false
        }, 200);
    })
    const popInfo = () => {
        pop=true
        opac=true
        setTimeout(() => {
            pop=false
            opac=false
            checkDetail.set(false)
            Detail.set({})
        }, 200);
    }
    const copyIban = () => {
        navigator.clipboard.writeText($Detail.iban)
    }
    function convertDate(d) {
        const date = new Date(d); // Convert seconds to milliseconds
        const day = date.getDate().toString().padStart(2, '0'); // Get day with leading zero
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }
</script>

<div class="popup-cont"  on:click|self={popInfo} on:keydown={() => {}}>
    <div class="black-bg" class:change={opac}></div>
    <section class:hide={pop}>
        <p class="dash"></p>
        <div class="upper-section">
            {#if $ActiveTab === 'your friends'}
                <div><img src={$Detail.imageUrl} alt=""></div>
                <h4 class="name upper">{$Detail.name}</h4>
                {:else if $ActiveTab === 'your wallet'}
                    <p class="date">Date: {convertDate($Detail.date)}</p>
                    <h4 class="name upper">{$Detail.name}</h4>
                    <p class="amount {$Detail.type === 'debit' ? 'negative' : 'positive'}"> {$Detail.type === 'debit' ? '- ' : '+ '} {$Detail.amount} USD</p>
            {/if}
            
        </div>
        <article>
            <div class="iban">
                <div>
                    <p class="title">IBAN Number</p>
                    <p class="upper content">{$Detail.iban}</p>
                </div>
                <div class="copy" on:click={copyIban} on:keydown={() => {}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                        <g clip-path="url(#clip0_17200_17)">
                          <path d="M19.7917 20.8333H5.20833V4.16667H7.29167V7.29167H17.7083V4.16667H19.7917M12.5 2.08333C12.7763 2.08333 13.0412 2.19308 13.2366 2.38843C13.4319 2.58378 13.5417 2.84873 13.5417 3.125C13.5417 3.40127 13.4319 3.66622 13.2366 3.86157C13.0412 4.05692 12.7763 4.16667 12.5 4.16667C12.2237 4.16667 11.9588 4.05692 11.7634 3.86157C11.5681 3.66622 11.4583 3.40127 11.4583 3.125C11.4583 2.84873 11.5681 2.58378 11.7634 2.38843C11.9588 2.19308 12.2237 2.08333 12.5 2.08333ZM19.7917 2.08333H15.4375C15 0.875 13.8542 0 12.5 0C11.1458 0 10 0.875 9.5625 2.08333H5.20833C4.6558 2.08333 4.12589 2.30283 3.73519 2.69353C3.34449 3.08423 3.125 3.61413 3.125 4.16667V20.8333C3.125 21.3859 3.34449 21.9158 3.73519 22.3065C4.12589 22.6972 4.6558 22.9167 5.20833 22.9167H19.7917C20.3442 22.9167 20.8741 22.6972 21.2648 22.3065C21.6555 21.9158 21.875 21.3859 21.875 20.8333V4.16667C21.875 3.61413 21.6555 3.08423 21.2648 2.69353C20.8741 2.30283 20.3442 2.08333 19.7917 2.08333Z" fill="#578CFF"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_17200_17">
                            <rect width="25" height="25" fill="white"/>
                          </clipPath>
                        </defs>
                    </svg>
                </div>
            </div>
            <div>
                <p class="title">Details</p>
                <p class="content">{$Detail.info}</p>
            </div>
        </article>
    </section>
</div>

<style>
    .popup-cont{
        position: absolute;
        inset: 0;
        bottom: 70px;
        z-index: 2;
        /* background: rgba(8, 8, 8, 0.90); */
        font-family: 'Outfit';
        font-style: normal;
        font-weight: 500;
        line-height: normal;
        transition: all .3s ease;
    }
    .change{
        opacity: 0;
    }
    .hide{
        transform: translateY(100%);
    }
    section{
        position: absolute;
        inset-inline: 0;
        bottom: 0;
        z-index: 3;
        width: 100%;
        border-top-left-radius: 20px;
        border-top-right-radius: 20px;
        background: #222830;
        overflow: hidden;
        transition: all .3s ease;
    }
    .upper-section{
        padding: 28px 0 23px 0;
        text-align: center;
    }
    .upper-section div{
        width: 51px;
        height: 51px;
        border-radius: 100px;
        border: 2px solid rgba(255, 255, 255, 0.25);
        overflow: hidden;
        margin:0 auto 13px auto;
    }
    img{
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .name{
        color: rgba(255, 255, 255, 0.45);
        font-size: 15px;
        letter-spacing: 0.75px;
    }
    article{
        padding: 22px 34px 28px 35px;
        background: #1B2027;
    }
    .copy{
        aspect-ratio: 1/1;
        height: 100%;
        border-radius: 10px; 
        background: rgba(90, 122, 235, 0.15);
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        height: 40px;
    }
    .copy:hover{
        background: rgba(90, 122, 235, 0.40);
    }
    .iban{
        display: flex;
        align-items: center;
        justify-content: space-between;
        text-shadow: 0px 0px 60px rgba(255, 255, 255, 0.15);
        margin-bottom: 27px;
    }
    .title{
        color: rgba(255, 255, 255, 0.30);
        font-size: var(--fs);
        letter-spacing: 0.42px;
    }
    .content{
        letter-spacing: 0.8px;
        font-size: var(--fm);
    }
    .content::first-letter{
        text-transform: capitalize;
    }
    .dash{
        width: 39px;
        height: 3px;
        position: absolute;
        top: 9px;
        left: 50%;
        transform: translateX(-50%);
        border-radius: 155px;
        background: rgba(0, 0, 0, 0.25);
    }
    .amount{
        font-size: var(--fxl);
        letter-spacing: 2.4px;
    }
    .date{
        color: rgba(255, 255, 255, 0.20);
        font-size: var(--fs);
        line-height: 113%;
        letter-spacing: 0.7px;
        margin-bottom: 18px;
    }
    .black-bg{
        position: absolute;
        background: rgba(8, 8, 8, 0.90);
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        width: 100%;
        height: 100%;
        pointer-events: none;
        transition: all .3s ease;
        z-index: -1;
    }
</style>