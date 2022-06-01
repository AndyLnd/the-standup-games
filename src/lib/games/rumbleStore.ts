import { get, writable } from 'svelte/store';
import { isHost, players } from '../lobby';
import { sendToAll, setOnPeerRTCMessage } from '../../lib/webRtc';

interface PlayerStore {
  name: string;
  color: string;
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isAlive: boolean;
}

interface GameStore {
  players: PlayerStore[];
  lost: string[];
  state: GameState;
}

export enum GameState {
  Lobby = 'lobby',
  InGame = 'inGame',
  GameOver = 'gameOver',
}

enum Directions {
  Up = 0b0001,
  Down = 0b0010,
  Left = 0b0100,
  Right = 0b1000,
}

enum Keys {
  'w' = Directions.Up,
  'ArrowUp' = Directions.Up,
  's' = Directions.Down,
  'ArrowDown' = Directions.Down,
  'a' = Directions.Left,
  'ArrowLeft' = Directions.Left,
  'd' = Directions.Right,
  'ArrowRight' = Directions.Right,
}

export const playerR = 10;
export const boardR = 100;

export const gameStore = writable<GameStore>({
  players: [],
  lost: [],
  state: GameState.Lobby,
});

const keyStates = new Map<string, number>();

const handleMessage = (peerId: string, type: string, data: any) => {
  switch (type) {
    case 'gamestate': {
      return handleGameStore(data);
    }
    case 'keydown': {
      return handleKeyDown(peerId, data);
    }
    case 'keyup': {
      return handleKeyUp(peerId, data);
    }
  }
};

setOnPeerRTCMessage(handleMessage);

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

const maxV = 1.5;
const accel = 0.1;
const drag = 0.95;

const updateVelocity = player => {
  const dir = keyStates.get(player.id) ?? 0;
  const dx = (dir & Directions.Left ? -accel : 0) + (dir & Directions.Right ? accel : 0);
  const dy = (dir & Directions.Up ? -accel : 0) + (dir & Directions.Down ? accel : 0);

  // normalize speed of diagonal movement
  const angleCorrection = dx !== 0 && dy !== 0 ? 0.707 : 1;
  player.vx = clamp(player.vx + dx * angleCorrection, -maxV, maxV);
  player.vy = clamp(player.vy + dy * angleCorrection, -maxV, maxV);
};

export const update = () => {
  requestAnimationFrame(update);
  if (get(gameStore).state !== GameState.InGame) return;

  const host = get(isHost);

  gameStore.update(({ players, lost, ...gs }) => {
    const updatedPlayers = players
      .map(p => {
        if (host && p.isAlive) {
          updateVelocity(p);
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= drag;
        p.vy *= drag;

        return { ...p, skip: [p.id] };
      })
      .map(({ skip, ...p }, _, ps) => {
        const others = ps.filter(({ id }) => !skip.includes(id));
        others.forEach(o => {
          const dx = p.x - o.x;
          const dy = p.y - o.y;
          const uniDist = Math.sqrt(dx * dx + dy * dy) / (playerR * 2);
          if (uniDist < 1) {
            const ϕ = Math.atan2(dy, dx);
            const dvx = Math.cos(ϕ) * (p.vx - o.vx);
            const dvy = Math.sin(ϕ) * (p.vy - o.vy);

            p.vx -= dvx * Math.sign(dx);
            p.vy -= dvy * Math.sign(dy);
            o.vx += dvx * Math.sign(dx);
            o.vy += dvy * Math.sign(dy);
            const offX = ((1 - uniDist) * dx) / 2;
            const offY = ((1 - uniDist) * dy) / 2;
            p.x += offX;
            p.y += offY;
            o.x -= offX;
            o.y -= offY;

            o.skip.push(p.id);
          }
        });
        return p;
      })
      .map(p => {
        if (!p.isAlive) return p;

        const isAlive = Math.sqrt(p.x * p.x + p.y * p.y) <= boardR;
        if (!isAlive) lost = [...lost, p.name];

        return { ...p, isAlive };
      });

    return { ...gs, players: updatedPlayers, lost };
  });

  if (host) {
    const gs = get(gameStore);
    sendToAll('gamestate', gs);
    if (gs.players.filter(p => p.isAlive).length < 2) {
      scheduleGameOver();
    }
  }
};

export const handleKeyDown = (playerId: string, key: string) => {
  if (!get(isHost)) {
    return sendToAll('keydown', key);
  }
  keyStates.set(playerId, (keyStates.get(playerId) ?? 0) | Keys[key as keyof typeof Keys]);
};

export const handleKeyUp = (playerId: string, key: string) => {
  if (!get(isHost)) {
    return sendToAll('keyup', key);
  }
  keyStates.set(playerId, (keyStates.get(playerId) ?? 0) & ~Keys[key as keyof typeof Keys]);
};

const handleGameStore = (state: GameStore) => {
  gameStore.set(state);
};

export const startGame = () => {
  keyStates.clear();
  if (get(isHost)) {
    const tau = Math.PI * 2;
    const angleOffset = Math.random() * tau;
    gameStore.set({
      lost: [],
      state: GameState.InGame,
      players: get(players).map(({ id, name, color }, i, { length }) => {
        const angle = (tau / length) * i + angleOffset;
        const dist = boardR - playerR * 2;
        return {
          id,
          name,
          color,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          vx: 0,
          vy: 0,
          isAlive: true,
        };
      }),
    });
    get(players).forEach(({ id }) => keyStates.set(id, 0));
    sendToAll('gamestate', get(gameStore));
  }
  gameOverScheduled = false;
};

let gameOverScheduled = false;
const scheduleGameOver = () => {
  if (gameOverScheduled) return;
  gameOverScheduled = true;
  setTimeout(() => {
    gameStore.update(gs => {
      const stillAlive = gs.players.filter(p => p.isAlive).map(p => p.name);
      const lost = [...gs.lost, ...stillAlive];
      return { ...gs, lost, state: GameState.GameOver };
    });
    sendToAll('gamestate', get(gameStore));
  }, 2000);
};
