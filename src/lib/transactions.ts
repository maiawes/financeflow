import {
  addMonths,
  format,
  getDate,
  getDaysInMonth,
  isAfter,
  isValid,
  parse,
  setDate,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseStoredDate } from "@/lib/date";

const RECURRING_ID_SEPARATOR = "__month__";

export interface TransactionLike {
  id: string;
  date: string;
  type: "income" | "expense";
  status: string;
  lastPaidMonth?: string | null;
  sourceId?: string;
  occurrenceMonth?: string;
  isRecurring?: boolean;
  installmentGroupId?: string;
  installmentNumber?: number;
  installmentTotal?: number;
}

export function getTransactionMonth(date?: string | null) {
  const parsedDate = parseStoredDate(date);

  return parsedDate ? format(parsedDate, "yyyy-MM") : "";
}

export function getCurrentMonthKey(baseDate = new Date()) {
  return format(baseDate, "yyyy-MM");
}

export function listTransactionMonths<T extends Pick<TransactionLike, "date">>(transactions: T[]) {
  return Array.from(
    new Set(
      transactions
        .map((transaction) => getTransactionMonth(transaction.date))
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));
}

export function getReferenceMonthFromTransactions<T extends Pick<TransactionLike, "date">>(
  transactions: T[],
  preferredMonth = getCurrentMonthKey(),
) {
  const months = listTransactionMonths(transactions);

  if (months.length === 0) {
    return preferredMonth;
  }

  if (months.includes(preferredMonth)) {
    return preferredMonth;
  }

  const nextMonth = months.find((month) => month > preferredMonth);

  return nextMonth ?? months[months.length - 1];
}

export function formatMonthKey(monthKey: string, pattern = "MMMM 'de' yyyy") {
  const parsedMonth = parse(`${monthKey}-01`, "yyyy-MM-dd", new Date());

  if (!isValid(parsedMonth)) {
    return monthKey;
  }

  return format(parsedMonth, pattern, { locale: ptBR });
}

export function isTransactionInMonth(transaction: Pick<TransactionLike, "date">, monthKey: string) {
  return getTransactionMonth(transaction.date) === monthKey;
}

export function formatTransactionDescription<
  T extends Pick<TransactionLike, "type"> & {
    desc: string;
    installmentNumber?: number;
    installmentTotal?: number;
  },
>(transaction: T) {
  if (
    transaction.type === "expense" &&
    transaction.installmentTotal &&
    transaction.installmentTotal > 1 &&
    transaction.installmentNumber
  ) {
    return `${transaction.desc} (${transaction.installmentNumber}/${transaction.installmentTotal})`;
  }

  return transaction.desc;
}

export function formatRecurringTransactionId(sourceId: string, monthKey: string) {
  return `${sourceId}${RECURRING_ID_SEPARATOR}${monthKey}`;
}

export function resolveTransactionDocumentId(transactionId: string) {
  return transactionId.split(RECURRING_ID_SEPARATOR)[0];
}

export function getOccurrenceMonthFromTransactionId(transactionId: string) {
  return transactionId.includes(RECURRING_ID_SEPARATOR)
    ? transactionId.split(RECURRING_ID_SEPARATOR)[1]
    : "";
}

function getExpenseStatusForMonth(transaction: TransactionLike, monthKey: string, sourceMonth: string) {
  if (transaction.lastPaidMonth) {
    return transaction.lastPaidMonth === monthKey ? "pago" : "pendente";
  }

  if (transaction.status === "pago" && sourceMonth === monthKey) {
    return "pago";
  }

  return "pendente";
}

export function expandRecurringExpenses<T extends TransactionLike>(
  transactions: T[],
  { pastMonths = 12, futureMonths = 12, baseDate = new Date() } = {},
): T[] {
  const rangeStart = startOfMonth(subMonths(baseDate, pastMonths));
  const rangeEnd = startOfMonth(addMonths(baseDate, futureMonths));

  return transactions.flatMap((transaction) => {
    if (transaction.type !== "expense" || transaction.isRecurring !== true) {
      return [transaction];
    }

    const sourceDate = parseStoredDate(transaction.date);

    if (!sourceDate) {
      return [transaction];
    }

    const sourceMonthDate = startOfMonth(sourceDate);
    const sourceMonth = format(sourceMonthDate, "yyyy-MM");
    const firstOccurrenceMonth = isAfter(sourceMonthDate, rangeStart) ? sourceMonthDate : rangeStart;
    const billingDay = getDate(sourceDate);
    const occurrences: T[] = [];

    for (
      let occurrenceMonthDate = firstOccurrenceMonth;
      !isAfter(occurrenceMonthDate, rangeEnd);
      occurrenceMonthDate = addMonths(occurrenceMonthDate, 1)
    ) {
      const occurrenceMonth = format(occurrenceMonthDate, "yyyy-MM");
      const occurrenceDay = Math.min(billingDay, getDaysInMonth(occurrenceMonthDate));
      const occurrenceDate = setDate(occurrenceMonthDate, occurrenceDay);

      occurrences.push({
        ...transaction,
        id: formatRecurringTransactionId(transaction.id, occurrenceMonth),
        sourceId: transaction.id,
        occurrenceMonth,
        isRecurring: true,
        date: format(occurrenceDate, "yyyy-MM-dd"),
        status: getExpenseStatusForMonth(transaction, occurrenceMonth, sourceMonth),
      } as T);
    }

    return occurrences;
  });
}
