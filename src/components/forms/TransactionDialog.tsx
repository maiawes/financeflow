"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Transaction } from "@/hooks/useTransactions";
import { normalizeStoredDate } from "@/lib/date";
import { useTransactions } from "@/hooks/useTransactions";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "income" | "expense";
  defaultValues?: Partial<Transaction> | null;
}

export function TransactionDialog({ open, onOpenChange, type, defaultValues }: TransactionDialogProps) {
  const isEdit = !!defaultValues;
  const isIncome = type === "income";
  const { addTransaction, updateTransaction } = useTransactions(type);

  const [desc, setDesc] = useState("");
  const [value, setValue] = useState("");
  const [cat, setCat] = useState("outro");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState(isIncome ? "recebido" : "pago");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (defaultValues) {
        setDesc(defaultValues.desc || "");
        setValue(defaultValues.value ? String(defaultValues.value) : "");
        setCat(defaultValues.cat || "outro");
        
        // Formatar data para YYYY-MM-DD se vier diferente
        if (defaultValues.date && defaultValues.date.includes("/")) {
           const [d, m, y] = defaultValues.date.split("/");
           setDate(`${y}-${m}-${d}`);
        } else {
           setDate(defaultValues.date || new Date().toISOString().split("T")[0]);
        }
        
        setStatus(defaultValues.status || (isIncome ? "recebido" : "pago"));
      } else {
        setDesc("");
        setValue("");
        setCat("outro");
        setDate(new Date().toISOString().split("T")[0]);
        setStatus(isIncome ? "recebido" : "pago");
      }
    }
  }, [open, defaultValues, isIncome]);

  const handleSave = async () => {
    if (!desc || !value || !date) {
      toast.error("Preencha descrição, valor e data.");
      return;
    }
    
    const storedDate = normalizeStoredDate(date);

    if (!storedDate) {
      toast.error("Use uma data válida.");
      return;
    }

    setLoading(true);
    
    const data = {
      desc,
      value: Number(value),
      cat,
      date: storedDate,
      status,
      type
    };

    try {
      if (isEdit && defaultValues?.id) {
        await updateTransaction(defaultValues.id, data);
        toast.success(`${isIncome ? "Receita" : "Despesa"} atualizada!`);
      } else {
        await addTransaction(data);
        toast.success(`${isIncome ? "Receita" : "Despesa"} criada!`);
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(`Erro ao salvar: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar" : "Nova"} {isIncome ? "Receita" : "Despesa"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="desc">Descrição</Label>
            <Input id="desc" placeholder={isIncome ? "Ex: Salário" : "Ex: Conta de Luz"} value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="value">Valor (R$)</Label>
              <Input id="value" type="number" placeholder="250.00" value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="cat">Categoria</Label>
              <Select value={cat} onValueChange={(val) => setCat(val || "outro")}>
                <SelectTrigger id="cat"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {isIncome ? (
                    <>
                      <SelectItem value="Fixo">Fixo</SelectItem>
                      <SelectItem value="Extra PM">Extra PM</SelectItem>
                      <SelectItem value="Bico">Bico Geral</SelectItem>
                      <SelectItem value="Avulsa">Avulsa</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Moradia">Moradia</SelectItem>
                      <SelectItem value="Alimentação">Alimentação</SelectItem>
                      <SelectItem value="Transporte">Transporte</SelectItem>
                      <SelectItem value="Assinaturas">Assinaturas</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(val) => setStatus(val || "")}>
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={isIncome ? "recebido" : "pago"}>{isIncome ? "Recebido" : "Pago"}</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading} className={isIncome ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
