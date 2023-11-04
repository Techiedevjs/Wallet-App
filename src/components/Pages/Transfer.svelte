<script>
    import { fade, slide } from 'svelte/transition';
    import {quintOut} from 'svelte/easing';
    let iban;
    let amount;
    const resetForm = () => {
        amount = '';
        iban = ''
    }
    const confirmTransfer = () => {
        let transferDetail = {
            amount:amount, iban:iban
        }
        resetForm()
        console.log(transferDetail)
    }
    const pasteIban = () => {
        navigator.clipboard.readText().then( text => iban = text)
    }
</script>

<section >
    <div>
        <svg class='first'xmlns="http://www.w3.org/2000/svg" width="47" height="47" viewBox="0 0 47 47" fill="none">
            <path d="M16.072 23.0241C16.2541 23.206 16.3986 23.422 16.4971 23.6597C16.5957 23.8975 16.6464 24.1523 16.6464 24.4096C16.6464 24.667 16.5957 24.9218 16.4971 25.1596C16.3986 25.3973 16.2541 25.6133 16.072 25.7952L12.4942 29.375H31.3333C31.8527 29.375 32.3508 29.5813 32.7181 29.9486C33.0854 30.3158 33.2917 30.8139 33.2917 31.3333C33.2917 31.8527 33.0854 32.3508 32.7181 32.7181C32.3508 33.0853 31.8527 33.2917 31.3333 33.2917H12.4942L16.074 36.8715C16.256 37.0533 16.4003 37.2692 16.4988 37.5068C16.5974 37.7444 16.6481 37.9991 16.6482 38.2563C16.6483 38.5136 16.5977 38.7683 16.4994 39.006C16.401 39.2436 16.2568 39.4596 16.075 39.6416C15.8932 39.8235 15.6773 39.9679 15.4397 40.0664C15.2021 40.1649 14.9474 40.2157 14.6902 40.2157C14.4329 40.2158 14.1782 40.1653 13.9405 40.0669C13.7029 39.9686 13.4869 39.8244 13.3049 39.6425L6.38026 32.7179C6.01313 32.3506 5.80688 31.8526 5.80688 31.3333C5.80688 30.8141 6.01313 30.316 6.38026 29.9488L13.3049 23.0241C13.6722 22.657 14.1702 22.4507 14.6895 22.4507C15.2087 22.4507 15.7068 22.657 16.074 23.0241H16.072ZM30.928 7.35746C31.2652 7.02028 31.7138 6.81772 32.1898 6.7878C32.6657 6.75787 33.1362 6.90263 33.513 7.19491L33.697 7.35746L40.6217 14.2821C40.9589 14.6193 41.1614 15.068 41.1914 15.5439C41.2213 16.0198 41.0765 16.4903 40.7843 16.8671L40.6217 17.0512L33.697 23.9739C33.3446 24.3251 32.8717 24.529 32.3744 24.5442C31.8771 24.5594 31.3927 24.3847 31.0195 24.0557C30.6463 23.7266 30.4123 23.2678 30.3651 22.7725C30.318 22.2772 30.4611 21.7825 30.7654 21.3889L30.928 21.2048L34.5058 17.625H15.6667C15.1675 17.6244 14.6874 17.4333 14.3245 17.0907C13.9615 16.748 13.7431 16.2797 13.7139 15.7814C13.6846 15.2832 13.8467 14.7925 14.1671 14.4097C14.4875 14.027 14.9419 13.781 15.4375 13.722L15.6667 13.7083H34.5078L30.928 10.1246C30.5608 9.75734 30.3546 9.25932 30.3546 8.74004C30.3546 8.22076 30.5608 7.7247 30.928 7.35746Z" fill="url(#paint0_linear_17200_828)"/>
            <defs>
              <linearGradient id="paint0_linear_17200_828" x1="5.80688" y1="6.78394" x2="47.7279" y2="21.1409" gradientUnits="userSpaceOnUse">
                <stop stop-color="#74A0FF"/>
                <stop offset="1" stop-color="#235BD5"/>
              </linearGradient>
            </defs>
        </svg>
    
        <p>CHOOSE THE AMOUNT</p>
        <h2>TRANSFER MONEY</h2>
    </div>
    <article>
        <div class="mb" class:pressed={iban}>
            <input type="text" name="" id="" placeholder="IBAN NUMBER" bind:value={iban} >
            <div class="copy" on:click={pasteIban} on:keydown={() => {}}>
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
        <div class:pressed={amount}>
            <input type="number" name="" id="" placeholder="AMOUNT" bind:value={amount}>
        </div>
    </article>
    <div class="btn-container">
        <button class="reset" on:click={resetForm}>RESET</button>
        <button class="confirm" on:click={confirmTransfer}>CONFIRM</button>
    </div>
</section>

<style>
    section{
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
        font-family: 'Outfit';
        padding-top: 30px;
        transition: all .3s ease;
    }
    .first{
        margin-bottom: var(--fs);
    }
    .btn-container{
        display: grid;
        grid-template-columns: 1fr 1fr;
        width: 100%;
        gap: 5px;
    }
    button{
        color: white;
        font-size: var(--fm);
        border: none;
        padding: var(--fm) 0;
        border-radius: var(--fm);
        font-weight: 700;
        line-height: normal;
        letter-spacing: 1.92px;
        cursor: pointer;
        margin-top: 41px;
    }
    .reset{
        background: rgba(166, 201, 255, 0.20);
    }
    .reset:hover{
        background: rgba(166, 201, 255, 0.4);
    }
    .confirm{
        background: linear-gradient(108deg, #74A0FF 0%, #235BD4 100%);
    }
    .confirm:hover{
        background: linear-gradient(108deg, #A5C1FF 0%, #2E70FF 100%);
    }
    p{
        font-size: var(--fs);
        color: rgba(255, 255, 255, 0.45);
        font-size: 15px;
        font-style: normal;
        font-weight: 500;
        line-height: normal;
        letter-spacing: 0.75px;
    }
    h2{
        font-size: var(--fxl);
        font-style: normal;
        font-weight: 600;
        line-height: normal;
        letter-spacing: 2.4px;
        text-transform: uppercase;
        margin-bottom: 37px;
    }
    input{
        font-size: var(--fl);
        width: 100%;
        height: 100%;
        background: transparent;
        color: rgba(0, 0, 0, 0.80);
        font-size: var(--fl);
        font-weight: 500;
        letter-spacing: 0.9px;
        text-transform: uppercase;
    }
    div:has(input){
        border-radius: 10px;
        border: 1px solid rgba(0, 0, 0, 0.25);
        background: #FFF;
        overflow: hidden;
        height: 40px;
        position: relative;
    }
    div:has(input):hover{
        border: 1px solid var(--Accent-blue, #578CFF);
        background: #E9F2FF;
    }
    .pressed{
        border: 1px solid var(--Accent-blue, #578CFF)
    }
    div:has(input):hover input::placeholder{
        color: rgba(87, 140, 255, 0.80);
    }
    .mb{
        margin-bottom: 8px;
    }
    .mb .copy{
        position: absolute;
        right: 0;
        top: 0;
        aspect-ratio: 1/1;
        height: 100%;
        border-radius: 10px;
        background: rgba(166, 201, 255, 0.50);
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }
    .copy:hover{
        background: rgba(90, 122, 235, 0.40);
    }
</style>