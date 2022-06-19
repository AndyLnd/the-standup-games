<script lang="ts">
  import { goto } from '$app/navigation';
  import { browser } from '$app/env';
  import Rumble from 'rumble/client';
</script>

<svelte:component this={Rumble} {browser} {goto} />
