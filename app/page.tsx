'use client'
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { Inventory } from './type/types';
import styles from './page.module.scss';

const socket = io('https://kitten-fond-bluejay.ngrok-free.app');

export default function HomePage() {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('https://kitten-fond-bluejay.ngrok-free.app/inventories')
        .then(res => res.json())
      .then(setInventories);

    socket.on('new inventory', (inv: Inventory) =>
      setInventories(prev => [inv, ...prev])
    );

    return () => {
      socket.off('new inventory')
    };
  }, []);

  const createInventory = () => {
    socket.emit('create inventory', { name, code });
    setName('');
    setCode('');
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>Inventários</h1>

      <div className={styles.formSection}>
        <input
          placeholder="Nome do inventário"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          placeholder="Código do inventário"
          value={code}
          onChange={e => setCode(e.target.value)}
        />
        <button onClick={createInventory}>Criar</button>
      </div>

      <ul className={styles.inventoryList}>
        {inventories.map(inv => (
          <li
            key={inv.id}
            className={styles.inventoryItem}
            onClick={() => router.push(`/inventory/${inv.id}/scans`)}
          >
            <b>{inv.name}</b> — {inv.code}
          </li>
        ))}
      </ul>
    </div>
  );
}
