import { Server } from 'socket.io';
import { LobbyMessages, IceMessages } from './src/consts/constants.js';

const { UpdateLobby, JoinRoom, SetProp } = LobbyMessages;

export default server => {
  const io = new Server(server);
  io.on('connection', socket => {
    const broadcastLobbyUpdate = async () => {
      const allSockets = await io.in(socket.data.room).fetchSockets();
      const data = allSockets.map(({ room, ...s }) => ({
        ...s.data,
        id: s.id,
      }));
      io.to(socket.data.room).emit(UpdateLobby, data);
    };

    socket.on('disconnect', () => {
      broadcastLobbyUpdate();
    });

    socket.on(JoinRoom, (gameId, props) => {
      Object.assign(socket.data, props);
      socket.data.room = gameId;
      socket.join(gameId);
      broadcastLobbyUpdate();
    });

    socket.on(SetProp, (key, value) => {
      socket.data[key] = value;
      broadcastLobbyUpdate();
    });

    Object.values(IceMessages).forEach(messageType => {
      socket.on(messageType, (to, ...params) => {
        io.to(to).emit(messageType, socket.id, ...params);
      });
    });
  });
};
