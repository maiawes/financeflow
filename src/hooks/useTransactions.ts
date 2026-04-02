import { useState, useEffect } from "react";
import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { normalizeStoredDate, parseStoredDate } from "@/lib/date";
import { addMonths, format } from "date-fns";
import {
  expandRecurringExpenses,
  getOccurrenceMonthFromTransactionId,
  getTransactionMonth,
  resolveTransactionDocumentId,
} from "@/lib/transactions";

export interface Transaction {
  id: string;
  desc: string;
  value: number;
  date: string;
  type: "income" | "expense";
  cat: string;
  status: string;
  sourceId?: string;
  occurrenceMonth?: string;
  isRecurring?: boolean;
  lastPaidMonth?: string | null;
  installmentGroupId?: string;
  installmentNumber?: number;
  installmentTotal?: number;
}

export function useTransactions(type?: "income" | "expense") {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscando as transações ordenadas por data descrescente (MVP scope)
    const q = query(collection(db, "transactions"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const normalizedDocs = snapshot.docs.map(doc => {
        const data = doc.data() as Transaction;

        return {
          ...data,
          id: doc.id,
          date: normalizeStoredDate(data.date),
        } as Transaction;
      });

      let docs = expandRecurringExpenses(normalizedDocs);
      
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

  const addTransaction = async (
    data: Omit<Transaction, "id">,
    options?: { installmentCount?: number },
  ) => {
    const installmentCount = data.type === "expense" ? Math.max(1, options?.installmentCount ?? 1) : 1;

    if (data.type === "expense" && installmentCount > 1) {
      const parsedDate = parseStoredDate(data.date);

      if (!parsedDate) {
        throw new Error("Use uma data válida para gerar as parcelas.");
      }

      const batch = writeBatch(db);
      const createdAt = new Date().toISOString();
      const installmentGroupId = globalThis.crypto?.randomUUID?.() ?? `parcel-${Date.now()}`;

      for (let index = 0; index < installmentCount; index += 1) {
        const installmentDate = format(addMonths(parsedDate, index), "yyyy-MM-dd");
        const transactionRef = doc(collection(db, "transactions"));

        batch.set(transactionRef, {
          ...data,
          date: installmentDate,
          status: index === 0 ? data.status : "pendente",
          isRecurring: false,
          installmentGroupId,
          installmentNumber: index + 1,
          installmentTotal: installmentCount,
          lastPaidMonth: index === 0 && data.status === "pago" ? getTransactionMonth(installmentDate) : null,
          createdAt,
        });
      }

      await batch.commit();
      return;
    }

    return addDoc(collection(db, "transactions"), {
      ...data,
      isRecurring: data.isRecurring ?? false,
      lastPaidMonth: data.type === "expense" && data.status === "pago" ? getTransactionMonth(data.date) : null,
      createdAt: new Date().toISOString(),
    });
  };

  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    const resolvedId = resolveTransactionDocumentId(id);
    const occurrenceMonth = getOccurrenceMonthFromTransactionId(id);
    const payload: Partial<Transaction> = { ...data };

    if (payload.date) {
      payload.date = normalizeStoredDate(payload.date);
    }

    if (occurrenceMonth && "status" in payload) {
      payload.lastPaidMonth = payload.status === "pago" ? occurrenceMonth : null;
    }

    return updateDoc(doc(db, "transactions", resolvedId), payload);
  };

  const deleteTransaction = async (id: string) => {
    return deleteDoc(doc(db, "transactions", resolveTransactionDocumentId(id)));
  };

  return { transactions, loading, addTransaction, updateTransaction, deleteTransaction };
}
