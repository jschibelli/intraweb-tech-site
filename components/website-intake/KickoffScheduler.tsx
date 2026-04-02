"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import { ChevronLeft, ChevronRight, Clock, Globe, Loader2, Video } from "lucide-react";
import type { KickoffIntakeContact } from "@/lib/websiteIntakeKickoff";

type Slot = { start: string; end?: string };

const WEEK_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/** Sunday-first month grid; null = padding from adjacent month. */
function buildMonthGrid(monthStart: DateTime): (DateTime | null)[][] {
  const first = monthStart.startOf("month");
  const last = monthStart.endOf("month");
  const pad = first.weekday % 7;
  const cells: (DateTime | null)[] = [];
  for (let i = 0; i < pad; i += 1) {
    cells.push(null);
  }
  for (let d = first; d <= last; d = d.plus({ days: 1 })) {
    cells.push(d);
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  const weeks: (DateTime | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

export type KickoffSchedulerProps = {
  bookingSession: string | null;
  submittedData: KickoffIntakeContact;
  fallbackCalUrl: string;
  kickoffTitle: string;
  onContinue: (opts: { scheduled: boolean; booked?: boolean; startIso?: string }) => void;
};

export default function KickoffScheduler({
  bookingSession,
  submittedData,
  fallbackCalUrl,
  kickoffTitle,
  onContinue,
}: KickoffSchedulerProps) {
  const defaultTz = useMemo(
    () => (typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC"),
    [],
  );
  const [timeZone, setTimeZone] = useState(defaultTz);
  const [viewMonth, setViewMonth] = useState(() => DateTime.now().startOf("month"));
  const [selectedDay, setSelectedDay] = useState<string>(() => DateTime.now().toISODate()!);
  const [use24h, setUse24h] = useState(false);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const [bookSuccess, setBookSuccess] = useState<{
    managementUrl: string;
    start: string;
    end: string;
    location?: string | null;
  } | null>(null);

  const timeZones = useMemo(() => {
    try {
      if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
        return (Intl as unknown as { supportedValuesOf: (k: string) => string[] }).supportedValuesOf("timeZone");
      }
    } catch {
      /* ignore */
    }
    return [
      "UTC",
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
      "Europe/London",
      "Europe/Paris",
      "Asia/Tokyo",
    ];
  }, []);

  const monthGrid = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);

  const daysWithSlots = useMemo(() => {
    const set = new Set<string>();
    for (const s of slots) {
      const d = DateTime.fromISO(s.start, { setZone: true }).setZone(timeZone).toISODate();
      if (d) {
        set.add(d);
      }
    }
    return set;
  }, [slots, timeZone]);

  const anchorForFetch = viewMonth.startOf("month").toISODate()!;
  const spanDays = viewMonth.daysInMonth ?? 31;

  const loadSlots = useCallback(async () => {
    if (!bookingSession) return;
    setSlotsLoading(true);
    setSlotsError(null);
    try {
      const u = new URL("/api/kickoff/slots", window.location.origin);
      u.searchParams.set("anchorDate", anchorForFetch);
      u.searchParams.set("timeZone", timeZone);
      u.searchParams.set("spanDays", String(spanDays));
      const res = await fetch(u.toString());
      const json = (await res.json()) as { ok?: boolean; slots?: Slot[]; error?: string };
      if (!res.ok) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }
      setSlots(json.slots || []);
    } catch (e) {
      setSlotsError(e instanceof Error ? e.message : "Could not load times");
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [anchorForFetch, timeZone, spanDays, bookingSession]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  const slotsForDay = useMemo(() => {
    return slots.filter((s) => {
      const d = DateTime.fromISO(s.start, { setZone: true }).setZone(timeZone).toISODate();
      return d === selectedDay;
    });
  }, [slots, selectedDay, timeZone]);

  const shiftMonth = (dir: -1 | 1) => {
    setViewMonth((m) => {
      const next = m.plus({ months: dir }).startOf("month");
      setSelectedDay(next.toISODate()!);
      setSelectedSlot(null);
      return next;
    });
  };

  const handleBook = async () => {
    if (!bookingSession || !selectedSlot) return;
    setBooking(true);
    setBookError(null);
    try {
      const res = await fetch("/api/kickoff/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingSession,
          start: selectedSlot.start,
          timeZone,
          kickoffTitle,
        }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        booking?: { managementUrl: string; start: string; end: string; location?: string | null };
      };
      if (!res.ok) {
        throw new Error(json.error || "Booking failed");
      }
      if (json.booking) {
        setBookSuccess({
          managementUrl: json.booking.managementUrl,
          start: json.booking.start,
          end: json.booking.end,
          location: json.booking.location,
        });
      }
    } catch (e) {
      setBookError(e instanceof Error ? e.message : "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  const formatSlotLabel = (iso: string) =>
    DateTime.fromISO(iso, { setZone: true })
      .setZone(timeZone)
      .toFormat(use24h ? "HH:mm" : "h:mm a");

  const formatFullWhen = (iso: string) =>
    DateTime.fromISO(iso, { setZone: true })
      .setZone(timeZone)
      .toFormat("EEEE, MMM d 'at' h:mm a");

  const selectedDayLabel = DateTime.fromISO(selectedDay).toFormat("ccc dd");
  const monthTitle = viewMonth.toFormat("MMMM yyyy");

  if (!bookingSession) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-gray-800 bg-gray-950/60 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-teal-300/90">Scheduling</p>
          <h4 className="mt-2 text-xl font-heading font-semibold text-white">Book your kickoff</h4>
          <p className="mt-3 text-sm text-gray-300 leading-relaxed">
            We could not start the in-app scheduler (session missing). Use the Cal.com link below to pick a time.
          </p>
          <a
            href={fallbackCalUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center rounded-md border border-teal-500/50 px-4 py-2.5 text-sm font-semibold text-teal-200 transition-colors hover:bg-teal-500/10"
          >
            Open scheduling page
          </a>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => onContinue({ scheduled: true })}
            className="rounded-md bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-500"
          >
            I booked my kickoff
          </button>
          <button
            type="button"
            onClick={() => onContinue({ scheduled: false })}
            className="rounded-md border border-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-200 transition-colors hover:border-gray-500"
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  if (bookSuccess) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-teal-500/40 bg-gradient-to-br from-teal-500/15 via-gray-950/50 to-orange-500/10 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-teal-300/90">Confirmed</p>
          <h4 className="mt-2 text-2xl font-heading font-semibold text-white">You are booked</h4>
          <p className="mt-3 text-gray-200 flex items-start gap-2">
            <Clock className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" aria-hidden />
            <span>{formatFullWhen(bookSuccess.start)}</span>
          </p>
          {bookSuccess.location ? (
            <p className="mt-2 text-sm text-gray-300 break-all">
              <span className="text-gray-500">Location / link: </span>
              {bookSuccess.location}
            </p>
          ) : null}
          <a
            href={bookSuccess.managementUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center rounded-md border border-orange-500/40 px-4 py-2 text-sm font-semibold text-orange-100 transition-colors hover:bg-orange-500/10"
          >
            Manage or reschedule in Cal.com
          </a>
        </div>
        <button
          type="button"
          onClick={() => onContinue({ scheduled: true, booked: true, startIso: bookSuccess.start })}
          className="rounded-md bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-500"
        >
          Continue to confirmation
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full min-w-0">
      {/* Cal-style 3 columns: event (~28%) | calendar (~42%) | times (~30%); min widths so layout matches Cal on wide screens */}
      <div
        className={[
          "w-full min-w-0 rounded-2xl border border-gray-800 bg-[#0c0c0f] shadow-xl overflow-hidden",
          "flex flex-col xl:flex-row xl:min-h-[520px]",
        ].join(" ")}
      >
        {/* Left — event info */}
        <aside className="xl:w-[28%] xl:min-w-[240px] xl:max-w-[320px] border-b xl:border-b-0 xl:border-r border-gray-800 p-6 sm:p-8 flex flex-col gap-6 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500/30 to-orange-500/20 border border-teal-500/30 text-sm font-heading font-bold text-white"
              aria-hidden
            >
              IW
            </div>
            <div>
              <p className="text-xs text-gray-500">IntraWeb Technologies</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-heading font-semibold text-white leading-snug">{kickoffTitle}</h3>
            <p className="mt-3 text-sm text-gray-400 leading-relaxed">
              Kickoff after your website intake. We use your answers to align on goals, timeline, and next steps. Book
              from this flow for the best context.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-gray-500 shrink-0" aria-hidden />
              <span>30 min</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Video className="w-4 h-4 text-gray-500 shrink-0" aria-hidden />
              <span>Video call (link in confirmation)</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Globe className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" aria-hidden />
              <label className="flex-1 min-w-0 space-y-1">
                <span className="sr-only">Time zone</span>
                <select
                  value={timeZone}
                  onChange={(e) => {
                    setTimeZone(e.target.value);
                    setSelectedSlot(null);
                  }}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900/80 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/60"
                >
                  {timeZones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </label>
            </li>
          </ul>
        </aside>

        {/* Middle — month calendar */}
        <div className="xl:w-[42%] xl:min-w-[300px] border-b xl:border-b-0 xl:border-r border-gray-800 p-4 sm:p-6 flex flex-col min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h4 className="text-base font-semibold text-white tracking-tight">{monthTitle}</h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                className="p-2 rounded-lg border border-transparent text-gray-300 hover:bg-gray-800/80 hover:border-gray-700"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                className="p-2 rounded-lg border border-transparent text-gray-300 hover:bg-gray-800/80 hover:border-gray-700"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            {WEEK_LABELS.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="space-y-1 flex-1">
            {monthGrid.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1">
                {week.map((cell, ci) => {
                  if (!cell) {
                    return <div key={`pad-${wi}-${ci}`} className="aspect-square min-h-[36px] sm:min-h-[40px]" />;
                  }
                  const ymd = cell.toISODate()!;
                  const isSelected = ymd === selectedDay;
                  const hasSlot = daysWithSlots.has(ymd);
                  const isToday = ymd === DateTime.now().toISODate();
                  return (
                    <button
                      key={ymd}
                      type="button"
                      onClick={() => {
                        setSelectedDay(ymd);
                        setSelectedSlot(null);
                      }}
                      className={[
                        "relative aspect-square min-h-[36px] sm:min-h-[40px] max-h-[48px] rounded-xl text-sm font-medium transition-colors text-gray-200 hover:bg-gray-800/90",
                        isSelected ? "bg-white text-gray-900 shadow-lg" : "",
                        !isSelected && hasSlot ? "bg-gray-800/90 border border-gray-700" : "",
                        !isSelected && !hasSlot ? "text-gray-500" : "",
                      ].join(" ")}
                    >
                      <span className="flex h-full w-full items-center justify-center">{cell.day}</span>
                      {hasSlot && !isSelected ? (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-teal-400" />
                      ) : null}
                      {isToday && !isSelected ? (
                        <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-orange-400/90" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Right — times */}
        <div className="xl:w-[30%] xl:min-w-[220px] p-4 sm:p-6 flex flex-col min-w-0 bg-gray-950/40">
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-sm font-semibold text-white">{selectedDayLabel}</p>
            <div
              className="flex rounded-lg border border-gray-700 p-0.5 text-[11px] font-medium"
              role="group"
              aria-label="Time format"
            >
              <button
                type="button"
                onClick={() => setUse24h(false)}
                className={[
                  "px-2 py-1 rounded-md transition-colors",
                  !use24h ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-200",
                ].join(" ")}
              >
                12h
              </button>
              <button
                type="button"
                onClick={() => setUse24h(true)}
                className={[
                  "px-2 py-1 rounded-md transition-colors",
                  use24h ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-200",
                ].join(" ")}
              >
                24h
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-[200px] max-h-[340px] overflow-y-auto pr-1 -mr-1 space-y-2">
            {slotsLoading ? (
              <div className="flex items-center gap-2 text-gray-400 py-10 justify-center text-sm">
                <Loader2 className="w-5 h-5 animate-spin shrink-0" aria-hidden />
                Loading times…
              </div>
            ) : slotsError ? (
              <p className="text-sm text-red-400 py-4" role="alert">
                {slotsError}
              </p>
            ) : slotsForDay.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center leading-relaxed">
                No times on this day. Try another date or month.
              </p>
            ) : (
              slotsForDay.map((s) => {
                const sel = selectedSlot?.start === s.start;
                return (
                  <button
                    key={s.start}
                    type="button"
                    onClick={() => setSelectedSlot(s)}
                    className={[
                      "w-full flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors text-left",
                      sel
                        ? "border-teal-500/70 bg-teal-500/15 text-white"
                        : "border-gray-700 bg-gray-900/50 text-gray-200 hover:border-gray-500",
                    ].join(" ")}
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500/90" aria-hidden />
                    {formatSlotLabel(s.start)}
                  </button>
                );
              })
            )}
          </div>

          <div className="mt-5 pt-5 border-t border-gray-800 space-y-3">
            {selectedSlot ? (
              <>
                {bookError ? (
                  <p className="text-xs text-red-400" role="alert">
                    {bookError}
                  </p>
                ) : null}
                <button
                  type="button"
                  disabled={booking}
                  onClick={() => void handleBook()}
                  className="w-full rounded-xl bg-white text-gray-900 px-4 py-3 text-sm font-semibold hover:bg-gray-100 disabled:opacity-50 transition-colors"
                >
                  {booking ? "Booking…" : "Continue"}
                </button>
              </>
            ) : (
              <p className="text-xs text-gray-500 text-center">Select a time to continue</p>
            )}
            <a
              href={fallbackCalUrl}
              target="_blank"
              rel="noreferrer"
              className="block text-center text-xs text-teal-400/90 hover:text-teal-300"
            >
              Open in Cal.com instead
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end border-t border-gray-800 pt-6">
        <button
          type="button"
          onClick={() => onContinue({ scheduled: true })}
          className="rounded-md border border-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-200 transition-colors hover:border-gray-500"
        >
          I already booked (skip)
        </button>
        <button
          type="button"
          onClick={() => onContinue({ scheduled: false })}
          className="rounded-md px-4 py-2.5 text-sm font-semibold text-gray-400 transition-colors hover:text-white"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
