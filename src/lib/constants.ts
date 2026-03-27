import { Home, LineChart, Calendar, Wallet, Landmark, Target, PieChart, Repeat, ReceiptText } from "lucide-react";

export const NAV_ITEMS = [
  { name: "Painel", href: "/", icon: Home },
  { name: "Receitas", href: "/receitas", icon: Wallet },
  { name: "Despesas", href: "/despesas", icon: Target },
  { name: "Variáveis", href: "/variaveis", icon: ReceiptText },
  { name: "Empréstimos", href: "/emprestimos", icon: Landmark },
  { name: "Assinaturas", href: "/assinaturas", icon: Repeat },
  { name: "Planejamento", href: "/planejamento", icon: LineChart },
  { name: "Calendário", href: "/calendario", icon: Calendar },
  { name: "Relatórios", href: "/relatorios", icon: PieChart },
];
