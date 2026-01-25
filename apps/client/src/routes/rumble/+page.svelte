<script lang="ts">
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import Rumble from 'rumble/client';
</script>

<Rumble {browser} {goto} />
