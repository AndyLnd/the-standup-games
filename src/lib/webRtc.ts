import { get } from 'svelte/store';
import { IceMessages } from '../consts/constants';
import { players, socket } from './lobby';

interface Connection {
  connection: RTCPeerConnection;
  sendChannel: RTCDataChannel;
  receiveChannel?: RTCDataChannel;
}

type PeerMessageHandler = (peerId: string, type: string, message: any) => void;

const connections = new Map<string, Connection>();

const peerConnectionConfig = {
  iceServers: [{ urls: 'stun:stun.stunprotocol.org:3478' }, { urls: 'stun:stun.l.google.com:19302' }],
};

let onPeerRTCMessage: PeerMessageHandler = () => {};
export const setOnPeerRTCMessage = (peerMessageHandler: PeerMessageHandler) => (onPeerRTCMessage = peerMessageHandler);

const estPeerConnection = async (remoteId: string, isCaller = true): Promise<Connection> => {
  const connection = new RTCPeerConnection(peerConnectionConfig);
  const sendChannel = connection.createDataChannel('sendChannel');
  let receiveChannel: RTCDataChannel | undefined = undefined;

  connection.ondatachannel = ev => {
    receiveChannel = ev.channel;
    receiveChannel.onmessage = message => {
      const { type, data } = parseMessage(message.data);
      onPeerRTCMessage(remoteId, type, data);
    };
  };

  connection.onicecandidate = ev => {
    if (ev.candidate) {
      socket.emit(IceMessages.Candidate, remoteId, ev.candidate);
    }
  };

  if (isCaller) {
    try {
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      socket.emit(IceMessages.Offer, remoteId, offer);
    } catch (e) {
      console.log(e);
    }
  }

  return { connection, sendChannel, receiveChannel };
};

export const connectAsHost = async () => {
  const otherPlayers = get(players).filter(player => player.id !== socket.id);
  const conns = await Promise.all(otherPlayers.map(async player => estPeerConnection(player.id)));
  conns.forEach((conn, i) => connections.set(otherPlayers[i].id, conn));
  await Promise.all([
    Promise.all(
      conns.map(
        ({ connection }) =>
          new Promise<void>(resolve => {
            connection.onconnectionstatechange = () => {
              if (connection.connectionState === 'connected') {
                resolve();
              }
            };
          })
      )
    ),
    Promise.all(
      conns.map(
        ({ sendChannel }) =>
          new Promise<void>(resolve => {
            sendChannel.onopen = () => resolve();
          })
      )
    ),
  ]);
  console.log('done');
};

const ensureConnection = async (id: string) => {
  let peerConnection = connections.get(id);
  if (!peerConnection) {
    peerConnection = await estPeerConnection(id, false);
    connections.set(id, peerConnection);
  }
  return peerConnection;
};

socket.on(IceMessages.Candidate, async (remoteId: string, candidate: RTCIceCandidateInit) => {
  if (remoteId === socket.id) return;
  const peerConnection = (await ensureConnection(remoteId)).connection;
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.log);
});

socket.on(IceMessages.Offer, async (remoteId: string, description: RTCSessionDescriptionInit) => {
  if (remoteId === socket.id) return;
  const peerConnection = (await ensureConnection(remoteId)).connection;
  try {
    peerConnection.setRemoteDescription(new RTCSessionDescription(description));
    const descriptionInit = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(descriptionInit);
    socket.emit(IceMessages.Answer, remoteId, descriptionInit);
  } catch (e) {
    console.log(e);
  }
});

socket.on(IceMessages.Answer, async (remoteId: string, description: RTCSessionDescriptionInit) => {
  if (remoteId === socket.id) return;
  const peerConnection = (await ensureConnection(remoteId)).connection;
  peerConnection.setRemoteDescription(new RTCSessionDescription(description));
});

export const sendTo = (toId: string, message: string) => {
  connections.get(toId)?.sendChannel.send(message);
};

export const sendToAll = (type: string, data?: any) => {
  const payload = JSON.stringify({ type, data });
  connections.forEach(con => con.sendChannel.send(payload));
};

export const parseMessage = (message: string) => {
  return JSON.parse(message) as { type: string; data: any };
};
