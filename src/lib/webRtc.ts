import { get } from 'svelte/store';
import { IceMessages } from '../consts/constants';
import { players, socket } from './lobby';

interface Connection {
  connection: RTCPeerConnection;
  sendChannel: RTCDataChannel;
  id: string;
}

type PeerMessageHandler = (peerId: string, type: string, message: any) => void;

const connections = new Map<string, Connection>();

const peerConnectionConfig = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun.l.google.com:19302?transport=udp',
      ],
    },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
};

let onPeerRTCMessage: PeerMessageHandler = () => {};
export const setOnPeerRTCMessage = (peerMessageHandler: PeerMessageHandler) => (onPeerRTCMessage = peerMessageHandler);

const estPeerConnection = async (peerId: string, isCaller = true): Promise<Connection> => {
  const connection = new RTCPeerConnection(peerConnectionConfig);
  const sendChannel = connection.createDataChannel('sendChannel');

  connection.ondatachannel = ev => {
    ev.channel.onmessage = message => {
      const { type, data } = parseMessage(message.data);
      onPeerRTCMessage(peerId, type, data);
    };
  };

  connection.onicecandidate = ev => {
    if (ev.candidate) {
      socket.emit(IceMessages.Candidate, peerId, ev.candidate);
    }
  };

  if (isCaller) {
    try {
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      socket.emit(IceMessages.Offer, peerId, offer);
    } catch (e) {
      console.log(e);
    }
  }

  return { connection, sendChannel, id: peerId };
};

const waitForConnected = (connection: RTCPeerConnection) =>
  new Promise<void>(resolve => {
    connection.onconnectionstatechange = () => {
      if (connection.connectionState === 'connected') {
        resolve();
      }
    };
  });

const waitForSendOpen = (sendChannel: RTCDataChannel) =>
  new Promise<void>(resolve => {
    sendChannel.onopen = () => resolve();
  });

const sendOffer = async ({ connection, id }: Connection) => {
  try {
    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);
    socket.emit(IceMessages.Offer, id, offer);
  } catch (e) {
    console.log(e);
  }
};

export const connectAsHost = async () => {
  const otherPlayers = get(players).filter(player => player.id !== socket.id);
  const conns = await Promise.all(otherPlayers.map(player => estPeerConnection(player.id)));

  conns.forEach((conn, i) => {
    sendOffer(conn);
    connections.set(otherPlayers[i].id, conn);
  });

  await Promise.all([
    ...conns.map(({ connection }) => waitForConnected(connection)),
    ...conns.map(({ sendChannel }) => waitForSendOpen(sendChannel)),
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

socket.on(IceMessages.Candidate, async (peerId: string, candidate: RTCIceCandidateInit) => {
  if (peerId === socket.id) return;
  const peerConnection = (await ensureConnection(peerId)).connection;
  peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.log);
});

socket.on(IceMessages.Offer, async (peerId: string, description: RTCSessionDescriptionInit) => {
  if (peerId === socket.id) return;
  const peerConnection = (await ensureConnection(peerId)).connection;
  try {
    peerConnection.setRemoteDescription(new RTCSessionDescription(description));
    const descriptionInit = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(descriptionInit);
    socket.emit(IceMessages.Answer, peerId, descriptionInit);
  } catch (e) {
    console.log(e);
  }
});

socket.on(IceMessages.Answer, async (peerId: string, description: RTCSessionDescriptionInit) => {
  if (peerId === socket.id) return;
  const peerConnection = (await ensureConnection(peerId)).connection;
  peerConnection.setRemoteDescription(new RTCSessionDescription(description));
});

/**
 * Communication via
 */

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
