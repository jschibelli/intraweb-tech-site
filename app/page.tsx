import Hero from "../components/Hero";
import ProblemStatement from "../components/ProblemStatement";
import Services from "../components/Services";
import { StatsSection } from "../components/StatsSection";
import Process from "../components/Process";
import Differentiators from "../components/Differentiators";
import TargetClient from "../components/TargetClient";
import Testimonials from "../components/Testimonials";
import SynaplyAI from "../components/SynaplyAI";
import FAQ from "../components/FAQ";
import EntranceReveal from "../components/ui/EntranceReveal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Implementation That Actually Works",
  description:
    "IntraWeb helps SMBs turn AI tool adoption into measurable operational savings through workflow automation and implementation delivery.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <main>
      <EntranceReveal>
        <Hero />
      </EntranceReveal>
      <EntranceReveal delayMs={40}>
        <ProblemStatement />
      </EntranceReveal>
      <section id="services">
        <EntranceReveal>
          <Services />
        </EntranceReveal>
      </section>
      <section id="stats">
        <EntranceReveal>
          <StatsSection />
        </EntranceReveal>
      </section>
      <section id="process">
        <EntranceReveal>
          <Process />
        </EntranceReveal>
      </section>
      <EntranceReveal>
        <Differentiators />
      </EntranceReveal>
      <EntranceReveal>
        <TargetClient />
      </EntranceReveal>
      <section id="testimonials">
        <EntranceReveal>
          <Testimonials />
        </EntranceReveal>
      </section>
      <EntranceReveal>
        <SynaplyAI />
      </EntranceReveal>
      <section id="faq">
        <EntranceReveal>
          <FAQ />
        </EntranceReveal>
      </section>
    </main>
  );
}
