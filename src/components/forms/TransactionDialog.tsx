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
import { AlertCircle } from "lucide-react";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "income" | "expense";
  defaultValues?: Partial<Transaction> | null;
}

export function TransactionDialog({ open, onOpenChange, type, defaultValues }: TransactionDialogProps) {
  const isEdit = !!defaultValues;
  const isIncome = type === "income";
  const { addTransaction, updateTransaction, recreateTransaction } = useTransactions(type);

  const [desc, setDesc] = useState("");
  const [value, setValue] = useState("");
  const [cat, setCat] = useState("outro");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState(isIncome ? "recebido" : "pago");
  const [paymentMode, setPaymentMode] = useState<"single" | "installment">("single");
  const [installmentCount, setInstallmentCount] = useState("2");
  const [loading, setLoading] = useState(false);
  
  const isExpenseInstallment = !isIncome && paymentMode === "installment";
  const wasInstallment = !isIncome && (defaultValues?.installmentTotal ?? 0) > 1;

  useEffect(() => {
    if (open) {
      if (defaultValues) {
        setDesc(defaultValues.desc || "");
        setValue(defaultValues.value ? String(defaultValues.value) : "");
        setCat(defaultValues.cat || "outro");
        
        if (defaultValues.date && defaultValues.date.includes("/")) {
           const [d, m, y] = defaultValues.date.split("/");
           setDate(`${y}-${m}-${d}`);
        } else {
           setDate(defaultValues.date || new Date().toISOString().split("T")[0]);
        }
        
        setStatus(defaultValues.status || (isIncome ? "recebido" : "pago"));
        setPaymentMode(defaultValues.installmentTotal && defaultValues.installmentTotal > 1 ? "installment" : "single");
        setInstallmentCount(defaultValues.installmentTotal ? String(defaultValues.installmentTotal) : "2");
      } else {
        setDesc("");
        setValue("");
        setCat("outro");
        setDate(new Date().toISOString().split("T")[0]);
        setStatus(isIncome ? "recebido" : "pago");
        setPaymentMode("single");
        setInstallmentCount("2");
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

    const parsedInstallmentCount = isExpenseInstallment ? Number(installmentCount) : 1;

    if (isExpenseInstallment && (!Number.isInteger(parsedInstallmentCount) || parsedInstallmentCount < 2)) {
      toast.error("Informe uma quantidade de parcelas maior que 1.");
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
        // Se for despesa e envolve parcelas (agora ou no default), usamos recreateTransaction para a Opção A
        if (!isIncome && (isExpenseInstallment || wasInstallment)) {
          await recreateTransaction(defaultValues.id, defaultValues.installmentGroupId, data, { installmentCount: parsedInstallmentCount });
          toast.success("Estrutura da transação atualizada com sucesso!");
        } else {
          await updateTransaction(defaultValues.id, data);
          toast.success(`${isIncome ? "Receita" : "Despesa"} atualizada!`);
        }
      } else {
        await addTransaction(data, { installmentCount: parsedInstallmentCount });
        toast.success(
          isExpenseInstallment
            ? `${parsedInstallmentCount} parcelas criadas com sucesso!`
            : `${isIncome ? "Receita" : "Despesa"} criada!`,
        );
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
              <Label htmlFor="value">{isExpenseInstallment ? "Valor da Parcela (R$)" : "Valor (R$)"}</Label>
              <Input id="value" type="number" placeholder={isExpenseInstallment ? "125.00" : "250.00"} value={value} onChange={(e) => setValue(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Data de Início</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          {!isIncome ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="payment-mode">Lançamento</Label>
                <Select
                  value={paymentMode}
                  onValueChange={(val) => setPaymentMode(val === "installment" ? "installment" : "single")}
                  // Removed disabled={isEdit}
                >
                  <SelectTrigger id="payment-mode"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Uma parcela somente</SelectItem>
                    <SelectItem value="installment">Em várias parcelas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="installment-count">Qtd. Parcelas</Label>
                <Input
                  id="installment-count"
                  type="number"
                  min="2"
                  placeholder="Ex: 10"
                  value={isExpenseInstallment ? installmentCount : ""}
                  onChange={(e) => setInstallmentCount(e.target.value)}
                  disabled={!isExpenseInstallment} // Removed || isEdit
                />
              </div>
            </div>
          ) : null}
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
          
          {/* Alertas sobre parcelamentos */}
          {!isIncome && isExpenseInstallment ? (
            <div className="flex gap-2 items-start p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {isEdit 
                  ? "Aviso: Salvar as alterações apagará o histórico da transação anterior e criará novas parcelas do zero a partir da Data de Início." 
                  : "O valor será replicado mês a mês na Data de Início automaticamente."}
              </p>
            </div>
          ) : null}
          
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
