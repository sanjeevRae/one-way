/** Formats an ISO date string (YYYY-MM-DD) into a readable label. */
export function formatDate(dateStr: string, locale = "en-US"): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}