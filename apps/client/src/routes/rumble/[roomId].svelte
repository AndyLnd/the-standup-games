<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { browser } from '$app/env';
  import Rumble from 'rumble/client';
  const { roomId } = $page.params;
</script>

<svelte:component this={Rumble} {browser} {roomId} {goto} />
