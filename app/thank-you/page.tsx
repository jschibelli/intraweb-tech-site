"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";

function ThankYouView({ scheduled }: { scheduled: string | null }) {
  const bookedKickoff = scheduled === "1";
  const skippedKickoff = scheduled === "0";

  const intro = bookedKickoff
    ? "Your intake is in and your kickoff is booked."
    : skippedKickoff
      ? "Your intake is in. You can book your kickoff when you're ready."
      : "Your intake is in and our team is reviewing the details.";

  return (
    <main className="bg-gray-900 text-white min-h-screen flex items-center justify-center px-4">
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{ backgroundImage: "url(/circuit-pattern.svg)", backgroundRepeat: "repeat", backgroundSize: "auto" }}
      >
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500 opacity-20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-500 opacity-20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center space-y-8">
        <div className="flex justify-center">
          <CheckCircle className="w-24 h-24 text-teal-400" />
        </div>

        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-teal-300">Website intake received</p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold">Thank you</h1>
          <p className="text-xl text-gray-300">{intro}</p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-950/40 p-6 text-left max-w-2xl mx-auto">
          <h2 className="text-2xl font-heading font-semibold text-white">What happens next?</h2>
          <ul className="mt-4 space-y-4 text-gray-300">
            <li className="flex items-start">
              <span className="text-teal-400 mr-3 mt-1">→</span>
              <span>Our team will review your submission and use your intake answers to shape the kickoff conversation.</span>
            </li>
            <li className="flex items-start">
              <span className="text-teal-400 mr-3 mt-1">→</span>
              <span>
                {bookedKickoff
                  ? "Watch for your Cal.com confirmation and meeting details. We will come prepared with your goals, timeline, and project notes."
                  : skippedKickoff
                    ? "You will receive a confirmation email now. If you skipped scheduling, the follow-up email will include your kickoff booking link."
                    : "You will receive a confirmation email shortly with the next steps for your website project."}
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-orange-400 mr-3 mt-1">→</span>
              <span>After kickoff, we will map the right scope, timeline, and proposal for your build.</span>
            </li>
          </ul>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-orange-500 hover:bg-teal-500 text-white font-semibold rounded-md transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

function ThankYouContent() {
  const searchParams = useSearchParams();
  const scheduled = searchParams?.get("scheduled") ?? null;
  return <ThankYouView scheduled={scheduled} />;
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<ThankYouView scheduled={null} />}>
      <ThankYouContent />
    </Suspense>
  );
}
