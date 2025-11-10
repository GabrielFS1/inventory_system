import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import knexLib from 'knex';
import config from '../knexfile.js';

const knex = knexLib(config.development);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', socket => {
  console.log('✅ Client connected:', socket.id);

  // Send all existing scans to the new client
  knex('scans').select('*').then(scans => {
    socket.emit('load scans', scans);
  });

  // When receiving a new scan
  socket.on('scan event', async (data: { barcode: string; description: string }) => {
    const { barcode, description } = data;
    const time_readed = new Date().toISOString();

    // Save in DB
    await knex('scans').insert({ barcode, description, time_readed });

    // Send to all clients
    io.emit('new scan', { barcode, description, time_readed });
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
