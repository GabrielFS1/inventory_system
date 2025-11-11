import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import knexLib from 'knex';
import config from '../knexfile.js';
import cors from 'cors';

const knex = knexLib(config.development);

const app = express();

app.use(express.json());
app.use(cors());

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  }
});

app.get('/inventories/:id/scans', async (req, res) => {
  const { id } = req.params;

  const inventory = await knex('inventories').where({ id }).first();
  if (!inventory)
    return res.status(404).json({ error: 'Inventário não encontrado.' });

  const scans = await knex('scans')
    .where({ inventory_id: id })
    .orderBy('time_readed', 'desc');

  res.json(scans);
});

app.get('/inventories/:id', async (req, res) => {
  const { id } = req.params;

  const inventory = await knex('inventories').where({ id }).first();
  if (!inventory)
    return res.status(404).json({ error: 'Inventário não encontrado.' });

  res.json(inventory);
});

app.get('/inventories', async (req, res) => {
  const inventories = await knex('inventories').select('*').orderBy('id', 'desc');
  res.json(inventories);
});

app.post('/inventories', async (req, res) => {
  const { name, code } = req.body;
  const [id] = await knex('inventories').insert({ name, code });
  res.json({ id, name });
});

app.delete('/inventories/:id', async (req, res) => {
  const { id } = req.params;

  await knex('scans').where({ inventory_id: id }).del();

  const deleted = await knex('inventories').where({ id }).del();

  if (!deleted) return res.status(404).json({ error: 'Inventário não encontrado.' });

  res.json({ message: `Inventário ${id} removido com sucesso.` });
});

app.post('/scans', async (req, res) => {
  const { inventory_id, barcode, description } = req.body;
  if (!inventory_id || !barcode || !description) {
    return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }

  const time_readed = new Date().toISOString();
  const [id] = await knex('scans').insert({ inventory_id, barcode, description, time_readed });

  const newScan = { id, inventory_id, barcode, description, time_readed };
  io.to(`inventory:${inventory_id}`).emit('new scan', newScan);

  res.status(201).json(newScan);
});

app.delete('/scans/:id', async (req, res) => {
  const { id } = req.params;

  const scan = await knex('scans').where({ id }).first();
  if (!scan) return res.status(404).json({ error: 'Scan não encontrado.' });

  await knex('scans').where({ id }).del();

  io.to(`inventory:${scan.inventory_id}`).emit('delete scan', { id });

  res.json({ message: `Scan ${id} removido com sucesso.` });
});


io.on('connection', socket => {
  console.log('Client connected:', socket.id);

  socket.on('join inventory', async (inventoryId: number) => {
    socket.join(`inventory:${inventoryId}`);
    const scans = await knex('scans').where({ inventory_id: inventoryId });
    socket.emit('load scans', scans);
  });

  socket.on('create inventory', async data => {
    const [id] = await knex('inventories').insert(data);
    const inv = await knex('inventories').where({ id }).first();
    io.emit('new inventory', inv);
  });

  socket.on('scan event', async (data: { inventory_id: number; barcode: string; description: string }) => {
    const { inventory_id, barcode, description } = data;
    const time_readed = new Date().toISOString();

    await knex('scans').insert({ barcode, description, time_readed, inventory_id });

    io.to(`inventory:${inventory_id}`).emit('new scan', { barcode, description, time_readed, inventory_id });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));