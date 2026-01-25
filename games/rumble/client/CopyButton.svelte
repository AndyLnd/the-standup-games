<script lang="ts">
  import type { Snippet } from "svelte";

  let { copyString = "", children }: { copyString?: string; children: Snippet } = $props();
  let isDone = $state(false);

  const copyToClipboard = async () => {
    const { state } = await navigator.permissions.query({
      name: "clipboard-write" as PermissionName,
    });
    if (state === "granted" || state === "prompt") {
      navigator.clipboard.writeText(copyString);
      isDone = true;
    }
  };
</script>

<button onclick={copyToClipboard} class:isDone onanimationend={() => isDone = false}>{@render children()}</button>

<style>
  button {
    cursor: pointer;
    border-radius: 0.2rem;
    background-color: rgb(95, 172, 95);
    border: none;
    padding: .5rem 1rem;
    position: relative;
  }
  .isDone::after {
    display:block;
    content:"👍";
    position:absolute;
    top: 50%;
    left: 0;
    font-size: 1.5rem;
    width: 100%;
    text-align: center;
    animation: forwards 1s done ease-in-out;
  }
  @keyframes done {
    0%{
      translate: 0 0;
      opacity: 0;
    }
    20%, 80%{
      translate: 0 -50%;
      opacity: 1;  
    }
    100%{
      translate: 0 -100%;
      opacity:0;
    }
  }
</style>
