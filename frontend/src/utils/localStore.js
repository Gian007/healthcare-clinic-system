import { useEffect, useState } from "react";

export function useLocalRecords(key, seed) {
  const [records, setRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : seed;
    } catch {
      return seed;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(records));
  }, [key, records]);

  const addRecord = (record) => setRecords((old) => [...old, record]);
  const updateRecord = (idKey, id, patch) => setRecords((old) => old.map((r) => r[idKey] === id ? { ...r, ...patch } : r));
  const deleteRecord = (idKey, id) => setRecords((old) => old.filter((r) => r[idKey] !== id));

  return { records, setRecords, addRecord, updateRecord, deleteRecord };
}

export function nextId(records, idKey) {
  return records.length ? Math.max(...records.map((r) => Number(r[idKey]) || 0)) + 1 : 1;
}
