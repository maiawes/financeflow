"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loan } from "@/hooks/useLoans";

interface LoanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<Loan> | null;
}

export function LoanDialog({ open, onOpenChange, defaultValues }: LoanDialogProps) {
  const isEdit = !!defaultValues;

  const [name, setName] = useState("");
  const [totalValue, setTotalValue] = useState("");
  const [installmentValue, setInstallmentValue] = useState("");
  const [totalInstallments, setTotalInstallments] = useState("");
  const [paidInstallments, setPaidInstallments] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (defaultValues) {
        setName(defaultValues.name || "");
        setTotalValue(defaultValues.totalValue ? String(defaultValues.totalValue) : "");
        setInstallmentValue(defaultValues.installmentValue ? String(defaultValues.installmentValue) : "");
        setTotalInstallments(defaultValues.totalInstallments ? String(defaultValues.totalInstallments) : "");
        setPaidInstallments(defaultValues.paidInstallments ? String(defaultValues.paidInstallments) : "0");
      } else {
        setName("");
        setTotalValue("");
        setInstallmentValue("");
        setTotalInstallments("");
        setPaidInstallments("0");
      }
    }
  }, [open, defaultValues]);

  const handleSave = async () => {
    if (!name || !totalValue || !installmentValue) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }

    setLoading(true);
    const data = {
      name,
      totalValue: Number(totalValue),
      installmentValue: Number(installmentValue),
      totalInstallments: Number(totalInstallments),
      paidInstallments: Number(paidInstallments)
    };

    try {
      if (isEdit && defaultValues?.id) {
        await updateDoc(doc(db, "loans", defaultValues.id), data);
        toast.success("Empréstimo atualizado com sucesso!");
      } else {
        await addDoc(collection(db, "loans"), { ...data, createdAt: new Date().toISOString() });
        toast.success("Empréstimo salvo com sucesso!");
      }
      onOpenChange(false);
    } catch (e: any) {
      toast.error("Erro ao salvar: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Contrato" : "Novo Empréstimo"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome / Instituição</Label>
            <Input id="name" placeholder="Ex: Consignado BB" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="value">Valor Total (R$)</Label>
            <Input id="value" type="number" placeholder="25000" value={totalValue} onChange={(e) => setTotalValue(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="parcela">Valor da Parcela (R$)</Label>
            <Input id="parcela" type="number" placeholder="550" value={installmentValue} onChange={(e) => setInstallmentValue(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="total">Qtd. Parcelas</Label>
              <Input id="total" type="number" placeholder="72" value={totalInstallments} onChange={(e) => setTotalInstallments(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pagas">Já Pagas</Label>
              <Input id="pagas" type="number" placeholder="0" value={paidInstallments} onChange={(e) => setPaidInstallments(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white">
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
