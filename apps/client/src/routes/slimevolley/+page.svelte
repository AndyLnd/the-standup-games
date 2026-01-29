<script lang="ts">
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import SlimeVolley from 'slimevolley/client';
</script>

<SlimeVolley {browser} {goto} />
