// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
  const io = new Server(httpServer);

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('createRoom', (room) => {
      socket.join(room);
      socket.emit('roomCreated', { room });
    });

    socket.on('joinRoom', (room) => {
      socket.join(room);
      io.to(room).emit('userJoined', { userId: socket.id });
    });

    socket.on('sendStream', ({ room, streamData }) => {
      socket.to(room).emit('receiveStream', { streamData });
    });

    socket.on('chatMessage', ({ room, message }) => {
      io.to(room).emit('chatMessage', { userId: socket.id, message });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
  });
});
