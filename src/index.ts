import http from "http";
import express from 'express'
import 'dotenv/config'
import bodyParser from 'body-parser'
import cors from 'cors'
//import {syncUser } from './middlewares/syncUser' 

import clientRoutes from './routes/client.routes';
import styleRoutes from './routes/style.route';
import mesureRoutes from './routes/mesure.routes';
import tableauRoutes from './routes/MesureType.routes';
import commandeRoutes from "./routes/commande.routes";
import FournitureRoutes from "./routes/fourniture.route";
import userRoute from "./routes/users.routes"

import { clerkMiddleware } from '@clerk/express'
import { startCheckDeliveriesJob } from "./services/jobs/checkDeliveries.job";
import { initializeSocket } from "./lib/socket";

const app = express()

app.use(clerkMiddleware());
//app.use(syncUser)
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

// ✅ CORRECTION : Initialiser Socket.io AVANT de créer le serveur
const { server, io } = initializeSocket(app);

// ✅ CORRECTION : Utiliser le serveur HTTP de Socket.io au lieu de app.listen()
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8888

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🔌 Socket.io initialized`);
});

// Démarrer les jobs cron
startCheckDeliveriesJob()

// Exposer io pour l'utiliser dans d'autres fichiers si nécessaire
app.set("io", io);

app.get("/", (req, res) => {
  res.json({ 
    message: "API Server is running", 
    timestamp: new Date().toISOString(),
    socket: io ? "initialized" : "not initialized"
  })
})

export { app, io };