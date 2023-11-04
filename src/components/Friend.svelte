<script>
  import { checkDetail, Detail } from "../store/stores";
  import {quintOut} from 'svelte/easing';
  import { fade, slide, scale } from 'svelte/transition';
  export let friend;
  let status;
  friend.online ? status = 'online' : status = 'offline';
  const handleClick = () => {
    checkDetail.set(true)
    Detail.set({
      iban: friend.iban,
      name: friend.name,
      imageUrl: friend.imageUrl,
      info: friend.about
    })
  }
</script>

<div class='{status}-cont friend' on:click={handleClick} on:keydown={() => {}} >
    <div class="img-cont">
        <img src={friend.imageUrl} alt={friend.name}>
    </div>
    <div>
        <p class={status}>{status}</p>
        <h4 class="name">{friend.name}</h4>
    </div>
    {#if status === 'online'}
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="52" viewBox="0 0 17 52" fill="none">
        <g filter="url(#filter0_d_17200_129)">
          <path d="M0 13C2.20914 13 4 14.7909 4 17V35C4 37.2091 2.20914 39 0 39V13Z" fill="#57FFAF" fill-opacity="0.4" shape-rendering="crispEdges"/>
        </g>
        <g filter="url(#filter1_d_17200_129)">
          <path d="M0 15C1.10457 15 2 15.8954 2 17V35C2 36.1046 1.10457 37 0 37V15Z" fill="#57FFAF" fill-opacity="0.7" shape-rendering="crispEdges"/>
        </g>
        <defs>
          <filter id="filter0_d_17200_129" x="-10" y="3" width="24" height="46" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset/>
            <feGaussianBlur stdDeviation="5"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0.341176 0 0 0 0 1 0 0 0 0 0.686275 0 0 0 0.25 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_17200_129"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_17200_129" result="shape"/>
          </filter>
          <filter id="filter1_d_17200_129" x="-15" y="0" width="32" height="52" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset/>
            <feGaussianBlur stdDeviation="7.5"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0.341176 0 0 0 0 1 0 0 0 0 0.686275 0 0 0 0.45 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_17200_129"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_17200_129" result="shape"/>
          </filter>
        </defs>
      </svg>
        {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="52" viewBox="0 0 17 52" fill="none">
            <g filter="url(#filter0_d_17200_736)">
              <path d="M0 13C2.20914 13 4 14.7909 4 17V35C4 37.2091 2.20914 39 0 39V13Z" fill="#FF2828" fill-opacity="0.4" shape-rendering="crispEdges"/>
            </g>
            <g filter="url(#filter1_d_17200_736)">
              <path d="M0 15C1.10457 15 2 15.8954 2 17V35C2 36.1046 1.10457 37 0 37V15Z" fill="#FF2828" fill-opacity="0.7" shape-rendering="crispEdges"/>
            </g>
            <defs>
              <filter id="filter0_d_17200_736" x="-10" y="3" width="24" height="46" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset/>
                <feGaussianBlur stdDeviation="5"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.156863 0 0 0 0 0.156863 0 0 0 0.25 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_17200_736"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_17200_736" result="shape"/>
              </filter>
              <filter id="filter1_d_17200_736" x="-15" y="0" width="32" height="52" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                <feOffset/>
                <feGaussianBlur stdDeviation="7.5"/>
                <feComposite in2="hardAlpha" operator="out"/>
                <feColorMatrix type="matrix" values="0 0 0 0 0.341176 0 0 0 0 1 0 0 0 0 0.686275 0 0 0 0.45 0"/>
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_17200_736"/>
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_17200_736" result="shape"/>
              </filter>
            </defs>
          </svg>
    {/if}
</div>

<style>
    .friend{
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.04);
        padding: 20px;
        display: flex;
        gap: 16px;
        align-items: center;
        position: relative;
        cursor: pointer;
        transition: all .3s ease;
    }
    .friend:hover{
        background: rgba(255, 255, 255, 0.10);
    }
    .img-cont{
        width: 40px;
        height: 40px;
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.65);
        overflow: hidden;
    }
    img{
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    h4{
        font-size: var(--fl);
        font-style: normal;
        font-weight: 500;
        line-height: 100%;
        letter-spacing: 0.9px;
    }
    p{
        text-transform: uppercase;
        font-size: var(--fxs);
        font-style: normal;
        font-weight: 600;
        margin-bottom: 3px;
    }
    .online{
        color: rgba(87, 255, 175, 0.50);
    }
    .offline{
        color: rgba(255, 40, 40, 0.50);
    }
    svg{
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
    }
</style>