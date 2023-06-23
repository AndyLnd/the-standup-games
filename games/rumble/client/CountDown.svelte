<div class="countdown">
  <div>3</div>
  <div>2</div>
  <div>1</div>
</div>

<style>
  .countdown {
    position: fixed;
    inset: 0;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
  }
  .countdown div {
    font-weight: 900;
    position: fixed;
    inset: auto;
    animation: fade 1s linear 1 forwards;
    transform: scale(1);
    opacity: 0;
    text-shadow: 0 0 5px white;
  }
  .countdown div:nth-child(1) {
    animation-delay: 0;
    font-size: 5vh;
  }
  .countdown div:nth-child(2) {
    animation-delay: 1s;
    font-size: 10vh;
  }
  .countdown div:nth-child(3) {
    animation-delay: 2s;
    font-size: 15vh;
  }
  @keyframes fade {
    from {
      transform: scale(1);
      opacity: 1;
    }
    to {
      transform: scale(5);
      opacity: 0;
    }
  }
</style>
