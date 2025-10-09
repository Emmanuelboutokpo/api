import express from 'express'
import 'dotenv/config'
import { clerkMiddleware } from '@clerk/express'
import bodyParser from 'body-parser'
import cors from 'cors'
import {syncUser } from './middlewares/syncUser' 
import clientRoutes from './routes/client.routes';
import styleRoutes from './routes/style.route';
import mesureRoutes from './routes/mesure.routes';
import tableauRoutes from './routes/tableauDeMesure.routes';
// import commandeRoutes from "./routes/commande.routes";

const app = express()
app.use(clerkMiddleware());
app.use(syncUser)
app.use(cors({
  origin: "*",
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', clientRoutes);
app.use('/api', styleRoutes);
app.use('/api', mesureRoutes);
app.use('/api', tableauRoutes);
// app.use("/api", commandeRoutes);

// Start the server and listen on the specified port
const PORT = process.env.PORT || 8888
app.listen(PORT, () => {
  console.log(`🚀 Server ready at: http://localhost:${PORT}`)
})
