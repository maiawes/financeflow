import { useState, useEffect } from "react";
import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { normalizeStoredDate, parseStoredDate } from "@/lib/date";

export interface Transaction {
  id: string;
  desc: string;
  value: number;
  date: string;
  type: "income" | "expense";
  cat: string;
  status: string;
}

export function useTransactions(type?: "income" | "expense") {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscando as transações ordenadas por data descrescente (MVP scope)
    const q = query(collection(db, "transactions"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let docs = snapshot.docs.map(doc => {
        const data = doc.data() as Transaction;

        return {
          ...data,
          id: doc.id,
          date: normalizeStoredDate(data.date),
        } as Transaction;
      });
      
      if (type) {
        docs = docs.filter(d => d.type === type);
      }
      
      // Ordenação local para não depender de índices complexos no Firestore agora
      docs.sort((a, b) => {
        const dateA = parseStoredDate(a.date)?.getTime() ?? 0;
        const dateB = parseStoredDate(b.date)?.getTime() ?? 0;

        return dateB - dateA;
      });
      
      setTransactions(docs);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar transações:", error);
      setTransactions([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [type]);

  const addTransaction = async (data: Omit<Transaction, "id">) => {
    return addDoc(collection(db, "transactions"), { ...data, createdAt: new Date().toISOString() });
  };

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    return updateDoc(doc(db, "transactions", id), data);
  };

  const deleteTransaction = async (id: string) => {
    return deleteDoc(doc(db, "transactions", id));
  };

  return { transactions, loading, addTransaction, updateTransaction, deleteTransaction };
}
