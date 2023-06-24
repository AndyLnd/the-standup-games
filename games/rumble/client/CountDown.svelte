<div class="countdown">
  <div>
    <svg height="40" viewBox="0 0 57.9 65.3">
      <path
        fill="#fff"
        stroke="#000"
        d="m0 56.9 3.2-15h16.9a6.9 6.9 0 0 0-.2.7l-.3 2.1-.3 2.9-.1 3.1q0 4.1 1 5.9 1.1 1.7 3 1.7 2.1 0 4-1.4 1.8-1.4 3.1-3.5t2-4.6q.8-2.6.8-5 0-4.6-2.4-6.8-2.3-2.3-5.7-2.3l.7-3.4.6-2.3.2-1.2q3.3 0 5.5-1 2.3-1.1 3.8-3 1.4-1.8 2-4.3.6-2.6.6-5.5l-.1-2.4q-.2-1.3-.6-2.3-.4-1.1-1.2-1.7-.7-.7-2-.7-2.7 0-5.3 3.2a25.4 25.4 0 0 0-3.7 8.2 65.3 65.3 0 0 0-.8 2.7H7.5l3-14.1q3-1.9 6.9-3.4 3.3-1.3 8-2.4Q30 0 36 0q3.9 0 7.8.7 3.9.6 7 2.3Q54 4.7 56 7.6q1.9 2.9 1.9 7.4 0 3.4-1.1 6-1.2 2.5-3.4 4.5t-5.3 3.6q-3 1.6-6.9 3 3 .3 5.6 1.2 2.6.9 4.6 2.5 1.9 1.6 3 3.9 1.2 2.3 1.2 5.5 0 4.3-2.3 8t-6.5 6.4q-4.3 2.7-10.3 4.2-6.1 1.5-13.6 1.5-7.1 0-12.5-1.8Q5 61.6 0 56.9Z"
      />
    </svg>
  </div>
  <div>
    <svg height="50" viewBox="0 0 58.9 64.5">
      <path
        fill="#fff"
        stroke="#000"
        d="m0 64.5 2.2-9.8q6.9-2.2 13.4-5.5 6.5-3.4 11.6-8.1 5.1-4.8 8.2-11.1 3-6.3 3-14.5 0-4-.8-6.2t-2.8-2.2q-1.8 0-3.3 1.7-1.6 1.7-2.9 4.3-1.2 2.6-2.3 5.8-1 3.2-1.7 6.2H6.5l3.3-15q5.6-4.8 11.8-7.4Q27.8 0 35.6 0q4.8 0 9 1.1Q49 2.2 52 4.6q3.2 2.3 5 5.9 2 3.5 2 8.4 0 3.7-1.3 7.3-1.2 3.6-4.4 7.5-3.1 3.8-8.5 8a126.5 126.5 0 0 1-13.2 8.8 204.2 204.2 0 0 1-.3.1h22.3l-2 13.9H0Z"
      />
    </svg>
  </div>
  <div>
    <svg height="80" viewBox="0 0 36.1 63.5">
      <path
        fill="#fff"
        stroke="#000"
        d="m0 17 1.5-6.7q6.2-.9 11.3-3.7 5-2.8 8-6.6h15.3L22.5 63.5H.9L10.8 17H0Z"
      />
    </svg>
  </div>
</div>

<style>
  svg {
    overflow: visible;
  }
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
    position: fixed;
    inset: auto;
    animation: fade 1s linear 1 forwards;
    transform: scale(1);
    opacity: 0;
    display: flex;
  }
  .countdown div svg {
    filter: drop-shadow(0 0 0.3rem white);
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
