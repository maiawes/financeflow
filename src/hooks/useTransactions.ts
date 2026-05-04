import { useState, useEffect } from "react";
import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc, writeBatch, getDocs, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { normalizeStoredDate, parseStoredDate } from "@/lib/date";
import { addMonths, format, parse, getDate, getDaysInMonth, setDate } from "date-fns";
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
      return { installmentGroupId, count: installmentCount };
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

  const recreateTransaction = async (
    id: string,
    installmentGroupId: string | undefined,
    data: Omit<Transaction, "id">,
    options?: { installmentCount?: number }
  ) => {
    const batch = writeBatch(db);

    if (installmentGroupId) {
      const q = query(collection(db, "transactions"), where("installmentGroupId", "==", installmentGroupId));
      const snapshot = await getDocs(q);
      snapshot.forEach(docSnap => batch.delete(docSnap.ref));
    } else {
      batch.delete(doc(db, "transactions", resolveTransactionDocumentId(id)));
    }

    const installmentCount = data.type === "expense" ? Math.max(1, options?.installmentCount ?? 1) : 1;
    const createdAt = new Date().toISOString();

    if (data.type === "expense" && installmentCount > 1) {
      const parsedDate = parseStoredDate(data.date);
      if (!parsedDate) throw new Error("Use uma data válida para gerar as parcelas.");
      
      const newInstallmentGroupId = globalThis.crypto?.randomUUID?.() ?? `parcel-${Date.now()}`;
      
      for (let index = 0; index < installmentCount; index += 1) {
        const installmentDate = format(addMonths(parsedDate, index), "yyyy-MM-dd");
        const transactionRef = doc(collection(db, "transactions"));
        
        batch.set(transactionRef, {
          ...data,
          date: installmentDate,
          status: index === 0 ? data.status : "pendente",
          isRecurring: false,
          installmentGroupId: newInstallmentGroupId,
          installmentNumber: index + 1,
          installmentTotal: installmentCount,
          lastPaidMonth: index === 0 && data.status === "pago" ? getTransactionMonth(installmentDate) : null,
          createdAt,
        });
      }
    } else {
      const singleRef = doc(collection(db, "transactions"));
      batch.set(singleRef, {
        ...data,
        isRecurring: data.isRecurring ?? false,
        lastPaidMonth: data.type === "expense" && data.status === "pago" ? getTransactionMonth(data.date) : null,
        createdAt,
        installmentGroupId: null,
        installmentNumber: null,
        installmentTotal: null
      });
    }

    await batch.commit();
  };

  const copyFixedExpensesToNextMonth = async (
    sourceMonth: string,
    targetMonth: string,
  ) => {
    const sourceMonthStart = `${sourceMonth}-01`;
    const sourceMonthEnd = format(
      addMonths(parse(sourceMonthStart, "yyyy-MM-dd", new Date()), 1),
      "yyyy-MM-dd",
    );
    const targetMonthDate = parse(`${targetMonth}-01`, "yyyy-MM-dd", new Date());
    const snapshot = await getDocs(collection(db, "transactions"));

    const batch = writeBatch(db);
    let copied = 0;
    let skipped = 0;

    snapshot.forEach((docSnap) => {
      const raw = docSnap.data() as Transaction;
      if (raw.type !== "expense" || raw.date < sourceMonthStart || raw.date >= sourceMonthEnd) {
        return;
      }

      const isInstallment = !!(raw.installmentTotal && raw.installmentTotal > 1);
      const installmentNumber = raw.installmentNumber ?? 0;
      const isActiveInstallment = isInstallment && (raw.status !== "pago" || installmentNumber < raw.installmentTotal!);

      if (raw.isRecurring || isActiveInstallment) {
        skipped += 1;
        return;
      }

      const parsedDate = parseStoredDate(raw.date);

      if (!parsedDate) {
        skipped += 1;
        return;
      }

      const copiedDate = setDate(
        targetMonthDate,
        Math.min(getDate(parsedDate), getDaysInMonth(targetMonthDate)),
      );
      const transactionRef = doc(collection(db, "transactions"));

      batch.set(transactionRef, {
        desc: raw.desc,
        value: raw.value,
        type: raw.type,
        cat: raw.cat,
        date: format(copiedDate, "yyyy-MM-dd"),
        status: "pendente",
        isRecurring: false,
        lastPaidMonth: null,
        sourceId: raw.sourceId ?? null,
        occurrenceMonth: raw.occurrenceMonth ?? null,
        installmentGroupId: null,
        installmentNumber: null,
        installmentTotal: null,
        createdAt: new Date().toISOString(),
      });
      copied += 1;
    });

    if (copied === 0) {
      return { copied, skipped };
    }

    await batch.commit();
    return { copied, skipped };
  };

  const deleteTransaction = async (id: string) => {
    return deleteDoc(doc(db, "transactions", resolveTransactionDocumentId(id)));
  };

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    recreateTransaction,
    copyFixedExpensesToNextMonth,
    deleteTransaction,
  };
}
