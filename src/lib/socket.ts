 import { Server } from "socket.io";

let io :any;

export const initSocket = (server : any) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket : any) => {
    console.log("✅ User connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
