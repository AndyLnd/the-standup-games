<script lang="ts">
  export let copyString = "";
  const copyToClipboard = async () => {
    const { state } = await navigator.permissions.query({
      name: "clipboard-write" as PermissionName,
    });
    if (state === "granted" || state === "prompt") {
      navigator.clipboard.writeText(copyString);
    }
  };
</script>

<button on:click={copyToClipboard}><slot /></button>

<style>
  button {
    cursor: pointer;
    border-radius: 0.2rem;
    background-color: rgb(95, 172, 95);
    border: none;
    padding: .5rem 1rem;
  }
</style>
