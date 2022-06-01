import { io, Socket } from 'socket.io-client';
import { writable, derived } from 'svelte/store';
import { LobbyMessages } from '../consts/constants';

const { UpdateLobby, JoinRoom, SetProp } = LobbyMessages;

export interface Player {
  name: string;
  id: string;
  ready: boolean;
  color: string;
}

export const socket: Socket = io();
export const id = () => socket.id;

socket.on(UpdateLobby, lobby => players.set(lobby));

export const players = writable<Player[]>([]);
export const isReady = derived(players, ps => ps.find(p => p.id === id())?.ready);
export const isHost = derived(players, ps => ps[0]?.id === id());

export const joinRoom = (gameId: string, props: Object = {}) => socket.emit(JoinRoom, gameId, props);
export const setProp = (key: string, value: any) => socket.emit(SetProp, key, value);
