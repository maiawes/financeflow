import { useState, useEffect } from "react";
import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Loan {
  id: string;
  name: string;
  totalValue: number;
  installmentValue: number;
  totalInstallments: number;
  paidInstallments: number;
  isRecurring?: boolean;
}

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "loans"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => {
        const data = doc.data() as Partial<Loan>;

        return {
          id: doc.id,
          name: data.name ?? "",
          totalValue: data.totalValue ?? 0,
          installmentValue: data.installmentValue ?? 0,
          totalInstallments: data.totalInstallments ?? 0,
          paidInstallments: data.paidInstallments ?? 0,
          isRecurring: data.isRecurring ?? false,
        } as Loan;
      });
      
      // Ordena por nome
      docs.sort((a, b) => a.name.localeCompare(b.name));
      
      setLoans(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addLoan = async (data: Omit<Loan, "id">) => {
    return addDoc(collection(db, "loans"), { ...data, createdAt: new Date().toISOString() });
  };

  const updateLoan = async (id: string, data: Partial<Loan>) => {
    return updateDoc(doc(db, "loans", id), data);
  };

  const deleteLoan = async (id: string) => {
    return deleteDoc(doc(db, "loans", id));
  };

  return { loans, loading, addLoan, updateLoan, deleteLoan };
}
