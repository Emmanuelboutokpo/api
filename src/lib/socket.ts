// lib/socket.ts
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { Express } from 'express';

let io: SocketIOServer | null = null;

export const initializeSocket = (app: Express) => {
  const server = createServer(app);
  
  io = new SocketIOServer(server, {
    cors: {
      origin: "*", // À modifier en production
      methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket) => {
    console.log(`✅ Client connecté: ${socket.id}`);

    // Rejoindre la room de l'utilisateur
    socket.on('join-user-room', (userId: string) => {
      socket.join(userId);
      console.log(`👤 User ${userId} a rejoint sa room`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client déconnecté: ${socket.id}`);
    });
  });

  return { server, io };
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io non initialisé. Appelez initializeSocket() d\'abord.');
  }
  return io;
};