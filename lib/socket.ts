import { Server as NetServer } from 'http';
import { NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';

export type NextApiResponseServerIo = NextApiResponse & {
  socket: any & {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

export const initSocket = (res: NextApiResponseServerIo) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new ServerIO(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('join-room', (roomId: string, userId: string) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);

        socket.on('send-message', (message: string) => {
          socket.to(roomId).emit('receive-message', {
            message,
            senderId: userId,
            timestamp: new Date()
          });
        });

        socket.on('disconnect', () => {
          socket.to(roomId).emit('user-disconnected', userId);
        });
      });
    });
  }
  return res.socket.server.io;
};