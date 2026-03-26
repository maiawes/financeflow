import { format, isValid, parse, parseISO } from "date-fns";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const BR_DATE_PATTERN = /^\d{2}\/\d{2}\/\d{4}$/;

export function parseStoredDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  let parsedDate: Date;

  if (BR_DATE_PATTERN.test(trimmed)) {
    parsedDate = parse(trimmed, "dd/MM/yyyy", new Date());
  } else if (ISO_DATE_PATTERN.test(trimmed)) {
    parsedDate = parse(trimmed, "yyyy-MM-dd", new Date());
  } else {
    parsedDate = parseISO(trimmed);
  }

  return isValid(parsedDate) ? parsedDate : null;
}

export function normalizeStoredDate(value?: string | null) {
  const parsedDate = parseStoredDate(value);

  return parsedDate ? format(parsedDate, "yyyy-MM-dd") : "";
}

export function formatStoredDate(value?: string | null, pattern = "dd/MM/yyyy") {
  const parsedDate = parseStoredDate(value);

  return parsedDate ? format(parsedDate, pattern) : "";
}
