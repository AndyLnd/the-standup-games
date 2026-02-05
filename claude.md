# standup.games

Multiplayer real-time game platform for team standups and remote team building.

**Website**: https://www.thestandup.games

## Tech Stack

- **Frontend**: SvelteKit 2 + Svelte 5 (Runes) + TypeScript + Vite 7
- **Backend**: Express 5 + Colyseus 0.16 (WebSocket multiplayer framework)
- **State Sync**: @colyseus/schema 3.x (binary serialization)
- **Monorepo**: npm workspaces + Turborepo
- **Deployment**: Docker (Node 22-alpine)

## Project Structure

```
standup.games/
├── apps/
│   ├── client/          # SvelteKit frontend (port 5173)
│   │   └── src/routes/  # File-based routing
│   └── server/          # Express + Colyseus backend (port 2567)
│       └── src/
│           ├── index.ts
│           └── arena.config.ts  # Room definitions
├── games/
│   ├── rumble/          # Battle royale game (production-ready)
│   │   ├── server/      # Game room + schema
│   │   ├── client/      # Svelte components + store
│   │   └── types/       # Generated types from schema
│   ├── slimevolley/     # Volleyball game (in development)
│   │   ├── server/
│   │   └── client/
│   └── utils/           # Shared utilities (vec.ts, keyhandler.ts)
└── packages/
    ├── eslint-config-custom/
    └── tsconfig/
```

## Commands

```bash
npm run dev          # Start client + server in parallel
npm run build        # Build all workspaces
npm run lint         # Lint all workspaces
npm run format       # Format with Prettier
```

## Architecture

### Client-Server Game Loop

1. Client sends input via WebSocket: `room.send("direction", angle)`
2. Server processes in `setSimulationInterval()` (fixed timestep)
3. Server broadcasts state via @colyseus/schema serialization
4. Client renders with `requestAnimationFrame()` (60 FPS)

### Game State Pattern

Server schema classes define authoritative state:

```typescript
// games/rumble/server/schema/Rumble.ts
class RumbleState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("number") worldSize = 1000;
  @type("string") state: GameState = "Lobby";
}
```

Client subscribes via Svelte stores (Colyseus 0.16 pattern):

```typescript
// games/rumble/client/rumbleStore.ts
import { getStateCallbacks } from "colyseus.js";

const $ = getStateCallbacks(room);

$(room.state).players.onAdd((player, sessionId) => {
  // Update Svelte store
});

$(room.state).listen("worldSize", (newSize) => {
  // React to state changes
});
```

### Adding a New Game

1. Create `games/<name>/server/schema/<Name>.ts` with @colyseus/schema
2. Create `games/<name>/server/index.ts` extending `Room<State>`
3. Register room in `apps/server/src/arena.config.ts`
4. Create `games/<name>/client/<Name>.svelte` components
5. Add route in `apps/client/src/routes/<name>/`

## Current Games

### Rumble (Production)
- Battle royale: players pushed to center by shrinking boundary
- Controls: WASD/arrows to move, Space to kick
- States: Lobby → CountDown (3s) → InGame → GameOver
- Features: Host controls, player name/color customization, adjustable game time (default 75s)
- Reconnection window: 2 seconds

### SlimeVolley (Playable)
- 2-player volleyball with slime characters
- Ball physics with gravity, collision detection, elastic bouncing
- Controls: Arrow keys or touch buttons for movement + jump
- States: Lobby → InGame → GameOver
- Score to win: 5 points
- Physics: Ball gravity 0.5, slime gravity 0.7, interpolation factor 0.3
- Reconnection window: 15 seconds

## Key Files

- `apps/server/src/arena.config.ts` - Room registration
- `games/*/server/schema/*.ts` - Game state schemas
- `games/*/client/*Store.ts` - Colyseus client + Svelte stores
- `games/utils/vec.ts` - Vector math utilities
- `games/utils/keyhandler.ts` - Input handling

## Environment

- Node 22+ (Docker uses node:22-alpine)
- npm 8.3.1+
- WebSocket port: 2567 (dev), 443 (prod)
- Frontend port: 5173 (dev), 80 (prod)
- Environment variables: `PORT_WS`, `VITE_PORT_WS` for WebSocket configuration

## Code Style

- TypeScript strict mode
- Experimental decorators enabled (for @colyseus/schema)
- Prettier for formatting
- ESLint with custom config

## Svelte 5 Patterns

This project uses Svelte 5 with the new Runes syntax:

```svelte
<script lang="ts">
  // Reactive state with $state rune
  let count = $state(0);

  // Derived values with $derived rune
  let doubled = $derived(count * 2);

  // Props with $props rune
  let { player, onKick } = $props<{ player: Player; onKick: () => void }>();

  // Side effects with $effect rune
  $effect(() => {
    console.log('count changed:', count);
  });
</script>
```

Key differences from Svelte 4:
- `let x = $state(value)` replaces `let x = value` for reactive variables
- `$derived(expr)` replaces `$: x = expr` for computed values
- `$effect(() => {...})` replaces `$: {...}` for side effects
- `$props()` replaces `export let` for component props

## SvelteKit Routing

SvelteKit 2 uses file-based routing with the `+` prefix convention:
- `+page.svelte` - Page component
- `+page.server.ts` - Server-side load/actions
- `+layout.svelte` - Layout wrapper
- `[param]/+page.svelte` - Dynamic routes

Example: `/rumble/[roomId]` maps to `src/routes/rumble/[roomId]/+page.svelte`

---

> **Note**: Keep this file updated when making significant changes to the project architecture, dependencies, or adding new games.
