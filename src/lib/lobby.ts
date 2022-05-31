import { io, Socket } from 'socket.io-client';
import { writable, derived } from 'svelte/store';
import { LobbyMessages } from '../consts/constants';

const { UpdateLobby, InitGame, SetName, SetReady, SetColor } = LobbyMessages;

export interface Player {
  name: string;
  id: string;
  isReady: boolean;
  color: string;
}

export const socket: Socket = io();
export const id = () => socket.id;

socket.on(UpdateLobby, lobby => players.set(lobby));

export const players = writable<Player[]>([]);
export const isReady = derived(players, ps => ps.find(p => p.id === id())?.isReady);
export const isHost = derived(players, ps => ps[0]?.id === id());

export const initGame = (name: string, gameId: string) => socket.emit(InitGame, name, gameId);

export const setName = (name: string) => socket.emit(SetName, name);
export const setColor = (color: string) => socket.emit(SetColor, color);

export const setReady = (isReady: boolean) => socket.emit(SetReady, isReady);

export const start = () => {};
