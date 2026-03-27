import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { normalizeStoredDate } from "@/lib/date";

export interface VariableExpense {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: "Alimentação" | "Combustível";
}

export function useVariableExpenses() {
  const [expenses, setExpenses] = useState<VariableExpense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "variableExpenses"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => {
        const data = doc.data() as Partial<VariableExpense>;

        return {
          id: doc.id,
          name: data.name ?? "",
          amount: data.amount ?? 0,
          date: normalizeStoredDate(data.date),
          category: data.category === "Combustível" ? "Combustível" : "Alimentação",
        } as VariableExpense;
      });

      docs.sort((a, b) => b.date.localeCompare(a.date));

      setExpenses(docs);
      setLoading(false);
    }, () => {
      setExpenses([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addVariableExpense = async (data: Omit<VariableExpense, "id">) => {
    return addDoc(collection(db, "variableExpenses"), { ...data, createdAt: new Date().toISOString() });
  };

  const updateVariableExpense = async (id: string, data: Partial<VariableExpense>) => {
    return updateDoc(doc(db, "variableExpenses", id), data);
  };

  const deleteVariableExpense = async (id: string) => {
    return deleteDoc(doc(db, "variableExpenses", id));
  };

  return { expenses, loading, addVariableExpense, updateVariableExpense, deleteVariableExpense };
}
