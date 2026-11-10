import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatMoney, timeAgo, formatDateShort } from "./format";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD"): string {
  // If amount looks like minor units (> 100 and typically an integer like 1500 or 2500 for $15/$25), or standard major units:
  // If task budgets are stored in dollars ($25) or minor units ($2500)
  // Let formatMoney handle standard integer minor units
  return formatMoney(amount, currency);
}

export function formatRelativeTime(date: string | null | undefined): string {
  return timeAgo(date);
}

export function formatDate(date: string | null | undefined): string {
  return formatDateShort(date);
}
