"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [loanType, setLoanType] = useState<"installment" | "recurring">("installment");
  const [loading, setLoading] = useState(false);
  const isRecurring = loanType === "recurring";

  useEffect(() => {
    if (open) {
      if (defaultValues) {
        setName(defaultValues.name || "");
        setTotalValue(defaultValues.totalValue ? String(defaultValues.totalValue) : "");
        setInstallmentValue(defaultValues.installmentValue ? String(defaultValues.installmentValue) : "");
        setTotalInstallments(defaultValues.totalInstallments ? String(defaultValues.totalInstallments) : "");
        setPaidInstallments(defaultValues.paidInstallments ? String(defaultValues.paidInstallments) : "0");
        setLoanType(defaultValues.isRecurring ? "recurring" : "installment");
      } else {
        setName("");
        setTotalValue("");
        setInstallmentValue("");
        setTotalInstallments("");
        setPaidInstallments("0");
        setLoanType("installment");
      }
    }
  }, [open, defaultValues]);

  const handleSave = async () => {
    if (!name || !installmentValue) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }

    if (!isRecurring && !totalValue) {
      toast.error("Informe o valor total do contrato.");
      return;
    }

    if (!isRecurring && !totalInstallments) {
      toast.error("Informe a quantidade de parcelas.");
      return;
    }

    setLoading(true);
    const parsedInstallmentValue = Number(installmentValue);
    const parsedTotalValue = isRecurring ? 0 : Number(totalValue);
    const parsedTotalInstallments = isRecurring ? 0 : Number(totalInstallments);
    const parsedPaidInstallments = isRecurring ? 0 : Number(paidInstallments);

    const data = {
      name,
      totalValue: parsedTotalValue,
      installmentValue: parsedInstallmentValue,
      totalInstallments: parsedTotalInstallments,
      paidInstallments: parsedPaidInstallments,
      isRecurring,
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
          <DialogTitle>{isEdit ? "Editar Contrato" : "Novo Contrato"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome / Instituição</Label>
            <Input id="name" placeholder="Ex: Banco Bari" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        <div className="grid gap-2">
          <Label htmlFor="loan-type">Tipo de cobrança</Label>
          <Select value={loanType} onValueChange={(value) => setLoanType(value as "installment" | "recurring")}>
            <SelectTrigger id="loan-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="installment">Parcelado</SelectItem>
              <SelectItem value="recurring">Recorrente mensal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="value">Valor Total (R$)</Label>
          <Input
            id="value"
            type="number"
            placeholder={isRecurring ? "Nao se aplica a cobranca recorrente" : "25000"}
            value={isRecurring ? "" : totalValue}
            onChange={(e) => setTotalValue(e.target.value)}
            disabled={isRecurring}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="parcela">Valor da Parcela (R$)</Label>
          <Input id="parcela" type="number" placeholder="550" value={installmentValue} onChange={(e) => setInstallmentValue(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="total">Qtd. Parcelas</Label>
            <Input
              id="total"
              type="number"
              placeholder={isRecurring ? "Nao se aplica" : "72"}
              value={isRecurring ? "" : totalInstallments}
              onChange={(e) => setTotalInstallments(e.target.value)}
              disabled={isRecurring}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pagas">Já Pagas</Label>
            <Input
              id="pagas"
              type="number"
              placeholder={isRecurring ? "Nao se aplica" : "0"}
              value={isRecurring ? "" : paidInstallments}
              onChange={(e) => setPaidInstallments(e.target.value)}
              disabled={isRecurring}
            />
          </div>
        </div>
        {isRecurring ? (
          <p className="text-xs text-muted-foreground">
            Cobrancas recorrentes contam no impacto mensal e na margem, mas nao entram em saldo devedor nem progresso de quitacao.
          </p>
        ) : null}
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
