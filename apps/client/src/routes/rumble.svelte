<script lang="ts">
  import Rumble from 'rumble/client';
  import { browser } from '$app/env';
</script>

<svelte:component this={Rumble} {browser} />
