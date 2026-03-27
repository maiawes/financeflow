"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { normalizeStoredDate } from "@/lib/date";
import { VariableExpense, useVariableExpenses } from "@/hooks/useVariableExpenses";

interface VariableExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<VariableExpense> | null;
}

export function VariableExpenseDialog({ open, onOpenChange, defaultValues }: VariableExpenseDialogProps) {
  const isEdit = !!defaultValues;
  const { addVariableExpense, updateVariableExpense } = useVariableExpenses();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState<VariableExpense["category"]>("Alimentação");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (defaultValues) {
      setName(defaultValues.name || "");
      setAmount(defaultValues.amount ? String(defaultValues.amount) : "");
      setDate(defaultValues.date || new Date().toISOString().split("T")[0]);
      setCategory(defaultValues.category === "Combustível" ? "Combustível" : "Alimentação");
      return;
    }

    setName("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setCategory("Alimentação");
  }, [open, defaultValues]);

  const handleSave = async () => {
    if (!name || !amount || !date) {
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
      name,
      amount: Number(amount),
      date: storedDate,
      category,
    };

    try {
      if (isEdit && defaultValues?.id) {
        await updateVariableExpense(defaultValues.id, data);
        toast.success("Gasto variável atualizado!");
      } else {
        await addVariableExpense(data);
        toast.success("Gasto variável cadastrado!");
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
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Gasto Variável" : "Novo Gasto Variável"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="variable-expense-name">Descrição</Label>
            <Input
              id="variable-expense-name"
              placeholder="Ex: Mercado do fim de semana"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="variable-expense-amount">Valor (R$)</Label>
              <Input
                id="variable-expense-amount"
                type="number"
                placeholder="120.50"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="variable-expense-date">Data</Label>
              <Input id="variable-expense-date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="variable-expense-category">Categoria</Label>
            <Select value={category} onValueChange={(value) => setCategory(value === "Combustível" ? "Combustível" : "Alimentação")}>
              <SelectTrigger id="variable-expense-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Alimentação">Alimentação</SelectItem>
                <SelectItem value="Combustível">Combustível</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white">
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
