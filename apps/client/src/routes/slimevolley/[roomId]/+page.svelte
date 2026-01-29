<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import SlimeVolley from 'slimevolley/client';

  let roomId = $derived($page.params.roomId);
</script>

<SlimeVolley {browser} {roomId} {goto} />
