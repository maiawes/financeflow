import { useEffect, useState } from "react";
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingDay: number;
  category: string;
  status: "active" | "paused";
}

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "subscriptions"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => {
        const data = doc.data() as Partial<Subscription>;

        return {
          id: doc.id,
          name: data.name ?? "",
          amount: data.amount ?? 0,
          billingDay: data.billingDay ?? 1,
          category: data.category ?? "Outros",
          status: data.status === "paused" ? "paused" : "active",
        } as Subscription;
      });

      docs.sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === "active" ? -1 : 1;
        }

        if (a.billingDay !== b.billingDay) {
          return a.billingDay - b.billingDay;
        }

        return a.name.localeCompare(b.name);
      });

      setSubscriptions(docs);
      setLoading(false);
    }, () => {
      setSubscriptions([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addSubscription = async (data: Omit<Subscription, "id">) => {
    return addDoc(collection(db, "subscriptions"), { ...data, createdAt: new Date().toISOString() });
  };

  const updateSubscription = async (id: string, data: Partial<Subscription>) => {
    return updateDoc(doc(db, "subscriptions", id), data);
  };

  const deleteSubscription = async (id: string) => {
    return deleteDoc(doc(db, "subscriptions", id));
  };

  return { subscriptions, loading, addSubscription, updateSubscription, deleteSubscription };
}
