import { Server } from 'socket.io';
import { LobbyMessages, IceMessages } from './src/consts/constants.js';

const lobbies = new Map();
const users = new Map();

export default server => {
  const io = new Server(server);
  io.on('connection', socket => {
    const sendToLobby = (...params) => {
      io.to(socket.data.room).emit(...params);
    };

    const broadcastLobbyUpdate = async () => {
      const allSockets = await io.in(socket.data.room).fetchSockets();
      const data = allSockets.map(s => ({
        id: s.id,
        name: s.data.name,
        color: s.data.color,
        isReady: s.data.ready,
      }));
      sendToLobby(LobbyMessages.UpdateLobby, data);
    };

    socket.on('disconnect', () => {
      broadcastLobbyUpdate();
    });

    socket.on(LobbyMessages.InitGame, (name, gameId) => {
      socket.data.room = gameId;
      socket.data.name = name;
      socket.data.ready = false;
      socket.join(gameId);
      broadcastLobbyUpdate();
    });

    socket.on(LobbyMessages.SetName, name => {
      socket.data.name = name;
      broadcastLobbyUpdate();
    });

    socket.on(LobbyMessages.SetColor, color => {
      socket.data.color = color;
      broadcastLobbyUpdate();
    });

    socket.on(LobbyMessages.SetReady, ready => {
      socket.data.ready = ready;
      broadcastLobbyUpdate();
    });

    Object.values(IceMessages).forEach(message => {
      socket.on(message, (to, ...params) => {
        socket.broadcast.to(to).emit(message, socket.id, ...params);
      });
    });
  });
};
