import { DateTime } from "luxon";

/**
 * Inclusive range: anchor day through anchor + (spanDays - 1), interpreted in `timeZone`.
 * spanDays capped at 14.
 */
export function rangeUtcFromAnchor(anchorYmd: string, timeZone: string, spanDays: number): { startUtc: string; endUtc: string } {
  const days = Math.min(Math.max(1, Math.floor(spanDays)), 14);
  const start = DateTime.fromISO(`${anchorYmd}T00:00:00`, { zone: timeZone });
  if (!start.isValid) {
    throw new Error(`Invalid anchor date or timezone: ${anchorYmd} / ${timeZone}`);
  }
  const end = start.plus({ days: days - 1 }).endOf("day");
  return { startUtc: start.toUTC().toISO()!, endUtc: end.toUTC().toISO()! };
}
