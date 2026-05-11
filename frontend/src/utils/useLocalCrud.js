import { useEffect, useMemo, useState } from 'react';
import { seed } from '../data/adminSeed';

export function useLocalCrud(key) {
  const storageKey = `admin_${key}`;
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : seed[key] || [];
  });

  useEffect(() => localStorage.setItem(storageKey, JSON.stringify(items)), [storageKey, items]);

  const api = useMemo(() => ({
    create: (data) => setItems(prev => [{ ...data, id: Date.now() }, ...prev]),
    update: (id, data) => setItems(prev => prev.map(item => item.id === id ? { ...item, ...data } : item)),
    remove: (id) => setItems(prev => prev.filter(item => item.id !== id)),
    reset: () => setItems(seed[key] || []),
  }), [key]);

  return [items, api];
}
