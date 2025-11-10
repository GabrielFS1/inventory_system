'use client';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type Scan = {
  barcode: string;
  description: string;
  time_readed: string;
};

const socket: Socket = io('http://localhost:3001');

export default function Home() {
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');
  const [scans, setScans] = useState<Scan[]>([]);

  useEffect(() => {
    socket.on('load scans', (dbScans: Scan[]) => {
      setScans(dbScans);
    });

    socket.on('new scan', (scan: Scan) => {
      setScans(prev => [...prev, scan]);
    });

    return () => {
      socket.off('load scans');
      socket.off('new scan');
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode || !description) return;
    socket.emit('scan event', { barcode, description });
    setBarcode('');
    setDescription('');
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>📦 Inventory System</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Barcode"
          value={barcode}
          onChange={e => setBarcode(e.target.value)}
          required
        />
        <input
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
        <button type="submit">Add Scan</button>
      </form>

      <ul>
        {scans.map((s, i) => (
          <li key={i}>
            <b>{s.barcode}</b> — {s.description} <br />
            <small>{new Date(s.time_readed).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
