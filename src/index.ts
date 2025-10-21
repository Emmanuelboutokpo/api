import http from "http";
import express from 'express'
import 'dotenv/config'
import bodyParser from 'body-parser'
import cors from 'cors'
import {syncUser } from './middlewares/syncUser' 

import clientRoutes from './routes/client.routes';
import styleRoutes from './routes/style.route';
import mesureRoutes from './routes/mesure.routes';
import tableauRoutes from './routes/MesureType.routes';
import commandeRoutes from "./routes/commande.routes";
import FournitureRoutes from "./routes/fourniture.route";
import userRoute from "./routes/users.routes"

import { clerkMiddleware } from '@clerk/express'
import { Server } from "socket.io";
import { startCheckDeliveriesJob } from "./services/jobs/checkDeliveries.job";

const app = express()
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

console.log('🔧 Server starting...')

app.use(clerkMiddleware());
app.use(syncUser)
app.use(cors({origin: "*", credentials: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', clientRoutes);
app.use('/api', styleRoutes);
app.use('/api', mesureRoutes);
app.use('/api', tableauRoutes);
app.use("/api", commandeRoutes);
app.use("/api", FournitureRoutes);
app.use("/api", userRoute);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
});

io.on("connection", (socket) => {
  console.log("🟢 Nouvelle connexion Socket:", socket.id);

  // chaque utilisateur s’identifie via son ID Clerk ou DB
  socket.on("register", (userId: string) => {
    socket.join(userId); // rejoint une "room" personnelle
    console.log(`👤 Utilisateur ${userId} rejoint sa room`);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket déconnecté:", socket.id);
  });
}); 

startCheckDeliveriesJob()
app.set("io", io);

// app.get("/", (req, res) => {
//   res.json({ 
//     message: "API Server is running", 
//     timestamp: new Date().toISOString()
//   })
// })

// ✅ CORRECTION : Convertir en NUMBER
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8888

// ✅ MAINTENANT ça marche : PORT est un number
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`)
})

export default app