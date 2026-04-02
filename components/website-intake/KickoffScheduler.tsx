"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import { Calendar, ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react";
import type { KickoffIntakeContact } from "@/lib/websiteIntakeKickoff";

type Slot = { start: string; end?: string };

const cardClass =
  "rounded-xl border border-gray-800 bg-gray-950/60 overflow-hidden min-w-0";
const labelClass = "text-xs uppercase tracking-[0.2em] text-teal-300/90";
const inputStyles =
  "w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent";

function addDaysYmd(ymd: string, delta: number): string {
  return DateTime.fromISO(ymd).plus({ days: delta }).toISODate()!;
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
  const [anchorDate, setAnchorDate] = useState(() => DateTime.now().toISODate()!);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [selectedDay, setSelectedDay] = useState<string>(() => DateTime.now().toISODate()!);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const [bookSuccess, setBookSuccess] = useState<{
    managementUrl: string;
    start: string;
    end: string;
    location?: string | null;
  } | null>(null);

  const weekDays = useMemo(() => {
    const start = DateTime.fromISO(anchorDate);
    return Array.from({ length: 7 }, (_, i) => start.plus({ days: i }).toISODate()!);
  }, [anchorDate]);

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

  const loadSlots = useCallback(async () => {
    if (!bookingSession) return;
    setSlotsLoading(true);
    setSlotsError(null);
    try {
      const u = new URL("/api/kickoff/slots", window.location.origin);
      u.searchParams.set("anchorDate", anchorDate);
      u.searchParams.set("timeZone", timeZone);
      u.searchParams.set("spanDays", "7");
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
  }, [anchorDate, timeZone, bookingSession]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  const slotsForDay = useMemo(() => {
    return slots.filter((s) => {
      const d = DateTime.fromISO(s.start, { setZone: true }).setZone(timeZone).toISODate();
      return d === selectedDay;
    });
  }, [slots, selectedDay, timeZone]);

  const shiftWeek = (dir: -1 | 1) => {
    const next = addDaysYmd(anchorDate, dir * 7);
    setAnchorDate(next);
    setSelectedDay(next);
    setSelectedSlot(null);
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
    DateTime.fromISO(iso, { setZone: true }).setZone(timeZone).toFormat("h:mm a");

  const formatFullWhen = (iso: string) =>
    DateTime.fromISO(iso, { setZone: true }).setZone(timeZone).toFormat("EEEE, MMM d 'at' h:mm a");

  if (!bookingSession) {
    return (
      <div className="space-y-6">
        <div className={`${cardClass} p-6`}>
          <p className={labelClass}>Scheduling</p>
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
          <p className={labelClass}>Confirmed</p>
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
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:gap-10">
        <div className={`${cardClass}`}>
          <div className="border-b border-gray-800 px-4 py-3 bg-gray-950/80 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-400" aria-hidden />
            <p className="text-sm font-medium text-white">Pick a time</p>
          </div>

          <div className="p-4 sm:p-5 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block space-y-1.5">
                <span className="text-xs text-gray-400">Time zone</span>
                <select
                  value={timeZone}
                  onChange={(e) => {
                    setTimeZone(e.target.value);
                    setSelectedSlot(null);
                  }}
                  className={inputStyles}
                >
                  {timeZones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs text-gray-400">Week starting</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => shiftWeek(-1)}
                    className="p-2 rounded-md border border-gray-700 text-gray-200 hover:border-teal-500/50"
                    aria-label="Previous week"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <input
                    type="date"
                    value={anchorDate}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v) {
                        setAnchorDate(v);
                        setSelectedDay(v);
                        setSelectedSlot(null);
                      }
                    }}
                    className={`${inputStyles} flex-1 min-w-0`}
                  />
                  <button
                    type="button"
                    onClick={() => shiftWeek(1)}
                    className="p-2 rounded-md border border-gray-700 text-gray-200 hover:border-teal-500/50"
                    aria-label="Next week"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              {weekDays.map((d) => {
                const active = d === selectedDay;
                const label = DateTime.fromISO(d).toFormat("ccc d");
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setSelectedDay(d);
                      setSelectedSlot(null);
                    }}
                    className={[
                      "px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
                      active
                        ? "bg-teal-500/20 border-teal-500/60 text-teal-100"
                        : "bg-gray-900/80 border-gray-700 text-gray-300 hover:border-gray-500",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="min-h-[200px]">
              {slotsLoading ? (
                <div className="flex items-center gap-2 text-gray-400 py-8">
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
                  Loading available times…
                </div>
              ) : slotsError ? (
                <p className="text-sm text-red-400" role="alert">
                  {slotsError}
                </p>
              ) : slotsForDay.length === 0 ? (
                <p className="text-sm text-gray-400 py-6">No openings on this day. Try another day or the next week.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {slotsForDay.map((s) => {
                    const sel = selectedSlot?.start === s.start;
                    return (
                      <button
                        key={s.start}
                        type="button"
                        onClick={() => setSelectedSlot(s)}
                        className={[
                          "rounded-lg px-3 py-2.5 text-sm font-medium border transition-colors",
                          sel
                            ? "bg-orange-500/25 border-orange-500/60 text-white"
                            : "bg-gray-900 border-gray-700 text-gray-200 hover:border-teal-500/40",
                        ].join(" ")}
                      >
                        {formatSlotLabel(s.start)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-800 bg-gray-950/40 p-5">
            <h5 className="text-base font-heading font-semibold text-white">Summary</h5>
            <p className="mt-2 text-sm text-gray-300">
              {submittedData.firstName} {submittedData.lastName}
              <br />
              <span className="text-gray-500">{submittedData.email}</span>
            </p>
            <p className="mt-3 text-xs text-gray-500 leading-relaxed">
              Meeting title sent to Cal: <span className="text-gray-400">{kickoffTitle}</span>
            </p>
          </div>

          <div className="rounded-xl border border-teal-500/25 bg-teal-500/5 p-5 space-y-4">
            {selectedSlot ? (
              <>
                <p className="text-sm text-gray-200">
                  <span className="text-gray-500">Selected: </span>
                  {formatFullWhen(selectedSlot.start)}
                </p>
                {bookError ? (
                  <p className="text-sm text-red-400" role="alert">
                    {bookError}
                  </p>
                ) : null}
                <button
                  type="button"
                  disabled={booking}
                  onClick={() => void handleBook()}
                  className="w-full rounded-md bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-500 disabled:opacity-50"
                >
                  {booking ? "Booking…" : "Confirm kickoff time"}
                </button>
              </>
            ) : (
              <p className="text-sm text-gray-400">Select a time slot to continue.</p>
            )}
          </div>

          <div className="rounded-xl border border-gray-800 bg-gray-950/40 p-4 space-y-2">
            <p className="text-xs text-gray-500">Prefer the full Cal.com page?</p>
            <a
              href={fallbackCalUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-teal-300 hover:text-teal-200"
            >
              Open Cal.com in a new tab
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end border-t border-gray-800 pt-6">
        <button
          type="button"
          onClick={() => onContinue({ scheduled: true })}
          className="rounded-md border border-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-200 transition-colors hover:border-gray-500 sm:order-2"
        >
          I already booked (skip)
        </button>
        <button
          type="button"
          onClick={() => onContinue({ scheduled: false })}
          className="rounded-md px-4 py-2.5 text-sm font-semibold text-gray-400 transition-colors hover:text-white sm:order-3"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
