<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import Rumble from 'rumble/client';

  let roomId = $derived($page.params.roomId);
</script>

<Rumble {browser} {roomId} {goto} />
