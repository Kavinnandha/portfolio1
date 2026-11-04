const formatters = new Map<number, Intl.NumberFormat>();

/**
 * Formats a stat value with thousands separators and fixed decimals. Same
 * locale on the server and in the client count-up, so the prerendered HTML
 * and the final animated frame match exactly.
 */
export function formatStat(value: number, decimals = 0): string {
  let format = formatters.get(decimals);
  if (!format) {
    format = new Intl.NumberFormat("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    formatters.set(decimals, format);
  }
  return format.format(value);
}
