<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import Rumble from 'rumble/client';
  $: roomId = $page.params.roomId;
</script>

<svelte:component this={Rumble} {browser} {roomId} {goto} />
