'use client';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'next/navigation';
import { Inventory, Scan } from '../../../type/types'
import styles from './inventory.module.scss';

const socket = io('https://kitten-fond-bluejay.ngrok-free.app');

export default function InventoryItemsPage() {
  const { inventory_id } = useParams();
  const [scans, setScans] = useState<Scan[]>([]);
  const [inventory, setInventory] = useState<Inventory>();
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetch(`https://kitten-fond-bluejay.ngrok-free.app/inventories/${inventory_id}`)
      .then(res => res.json())
      .then(setInventory);
  }, []);

  useEffect(() => {
    if (!inventory_id) return;

    socket.emit('join inventory', Number(inventory_id));

    socket.on('load scans', (dbScans: Scan[]) => setScans(dbScans));
    socket.on('new scan', (scan: Scan) => setScans(prev => [scan, ...prev]));

    return () => {
      socket.off('load scans');
      socket.off('new scan');
    };
  }, [inventory_id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode || !description) return;
    socket.emit('scan event', {
      inventory_id: Number(inventory_id),
      barcode,
      description
    });
    setBarcode('');
    setDescription('');
  };

  if (!inventory)
    return <>Carregando ...</>

  return (
    <div className={styles.inventoryContainer}>
      <h2 className={styles.title}>Itens do {inventory.name}</h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          placeholder="Barcode"
          value={barcode}
          onChange={e => setBarcode(e.target.value)}
        />
        <input 
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <button type="submit">Adicionar</button>
      </form>

      <ul className={styles.scanList}>
        {scans.map((s, i) => (
          <li key={i} className={styles.scanItem}>
            <b>{s.barcode}</b> — {s.description}
            <br />
            <small>{new Date(s.time_readed).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
