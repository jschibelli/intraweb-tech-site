"use client";

import EntranceReveal from "@/components/ui/EntranceReveal";
import WebsiteIntakeForm from "@/components/shared/website-intake-form";
import { ClipboardList, Mail } from "lucide-react";

export default function WebsiteIntakePage() {
  return (
    <main className="bg-gray-900 text-white">
      <EntranceReveal>
        <section
          className="page-hero"
          style={{
            backgroundImage: "url(/circuit-pattern.svg)",
            backgroundRepeat: "repeat",
            backgroundSize: "auto",
          }}
        >
          <div className="absolute inset-0 pointer-events-none select-none">
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500 opacity-20 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-500 opacity-20 rounded-full blur-3xl" />
          </div>
          <div className="page-hero-content max-w-5xl mx-auto px-4 text-left sm:text-center">
            <p className="page-hero-eyebrow">Project intake</p>
            <h1 className="page-hero-heading">Website Intake Form</h1>
            <p className="page-hero-subheading font-body mb-4">
              Help us scope your website build accurately.
            </p>
            <p className="text-base md:text-lg text-white/80 max-w-3xl mx-auto sm:text-center">
              This form takes about 10 minutes. The more context you share, the
              faster we can give you a clean scope and timeline.
            </p>
          </div>
        </section>
      </EntranceReveal>

      <EntranceReveal>
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_7fr] gap-10 lg:gap-14 xl:gap-20 items-start">
              <div className="min-w-0 lg:max-w-md lg:pr-2">
                <h2 className="text-2xl font-heading font-bold mb-6 lg:mb-8">
                  What this does
                </h2>
                <div className="space-y-5 text-gray-300">
                  <div className="flex items-start gap-3">
                    <ClipboardList className="w-5 h-5 text-teal-400 mt-0.5 shrink-0" aria-hidden />
                    <p>
                      Captures goals, pages, design preferences, integrations,
                      and budget so we can scope your build without a long back
                      and forth.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-teal-400 mt-0.5 shrink-0" aria-hidden />
                    <p>
                      If you’d rather email, reach us at{" "}
                      <a
                        href="mailto:human@intrawebtech.com"
                        className="text-gray-300 hover:text-teal-400 transition-colors"
                      >
                        human@intrawebtech.com
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <h2 className="text-2xl font-heading font-bold mb-6 lg:mb-8">
                  Website Intake
                </h2>
                <WebsiteIntakeForm />
              </div>
            </div>
          </div>
        </section>
      </EntranceReveal>
    </main>
  );
}

