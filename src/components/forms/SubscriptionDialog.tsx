"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Subscription, useSubscriptions } from "@/hooks/useSubscriptions";

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<Subscription> | null;
}

const SUBSCRIPTION_CATEGORIES = [
  "Streaming",
  "Música",
  "Produtividade",
  "Cloud",
  "Educação",
  "Fitness",
  "Outros",
];

export function SubscriptionDialog({ open, onOpenChange, defaultValues }: SubscriptionDialogProps) {
  const isEdit = !!defaultValues;
  const { addSubscription, updateSubscription } = useSubscriptions();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [billingDay, setBillingDay] = useState("1");
  const [category, setCategory] = useState("Outros");
  const [status, setStatus] = useState<Subscription["status"]>("active");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (defaultValues) {
      setName(defaultValues.name || "");
      setAmount(defaultValues.amount ? String(defaultValues.amount) : "");
      setBillingDay(defaultValues.billingDay ? String(defaultValues.billingDay) : "1");
      setCategory(defaultValues.category || "Outros");
      setStatus(defaultValues.status === "paused" ? "paused" : "active");
      return;
    }

    setName("");
    setAmount("");
    setBillingDay("1");
    setCategory("Outros");
    setStatus("active");
  }, [open, defaultValues]);

  const handleSave = async () => {
    if (!name || !amount) {
      toast.error("Preencha nome e valor.");
      return;
    }

    const parsedBillingDay = Number(billingDay);

    if (parsedBillingDay < 1 || parsedBillingDay > 31) {
      toast.error("Escolha um vencimento entre 1 e 31.");
      return;
    }

    setLoading(true);

    const data = {
      name,
      amount: Number(amount),
      billingDay: parsedBillingDay,
      category,
      status,
    };

    try {
      if (isEdit && defaultValues?.id) {
        await updateSubscription(defaultValues.id, data);
        toast.success("Assinatura atualizada com sucesso!");
      } else {
        await addSubscription(data);
        toast.success("Assinatura cadastrada com sucesso!");
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
          <DialogTitle>{isEdit ? "Editar Assinatura" : "Nova Assinatura"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="subscription-name">Nome</Label>
            <Input id="subscription-name" placeholder="Ex: Spotify" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="subscription-amount">Valor mensal (R$)</Label>
              <Input id="subscription-amount" type="number" placeholder="29.90" value={amount} onChange={(event) => setAmount(event.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subscription-billing-day">Dia do vencimento</Label>
              <Input id="subscription-billing-day" type="number" min="1" max="31" value={billingDay} onChange={(event) => setBillingDay(event.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="subscription-category">Categoria</Label>
              <Select value={category} onValueChange={(value) => setCategory(value || "Outros")}>
                <SelectTrigger id="subscription-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBSCRIPTION_CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subscription-status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value === "paused" ? "paused" : "active")}>
                <SelectTrigger id="subscription-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="paused">Pausada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading} className="bg-sky-600 hover:bg-sky-700 text-white">
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
