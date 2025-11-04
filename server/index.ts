import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

const port = process.env.SOCKET_PORT || 3001;

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.post('/api/teste', express.json(), (req, res) => {
  const { message } = req.body;
  io.emit('chat message', message);
  res.json({ status: 'Mensagem enviada', message });
});

io.on('connection', (socket: Socket) => {
  console.log(`Usuário conectado no socket: ${socket.id}`);

  socket.on('chat message', (msg: string) => {
    console.log('Mensagem:', msg);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log(`Usuário desconectou: ${socket.id}`);
  });
});

httpServer.listen(port, () => {
  console.log(`Servidor Socket.IO/Express rodando em http://localhost:${port}`);
});
