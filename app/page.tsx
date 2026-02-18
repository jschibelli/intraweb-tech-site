import dynamic from "next/dynamic";
import Hero from "../components/Hero";
import EntranceReveal from "../components/ui/EntranceReveal";
import type { Metadata } from "next";
import heroContent from "../data/hero.json";

const ProblemStatement = dynamic(() => import("../components/ProblemStatement"), { ssr: true });
const Services = dynamic(() => import("../components/Services"), { ssr: true });
const StatsSection = dynamic(() => import("../components/StatsSection").then((m) => m.StatsSection), {
  ssr: true,
});
const Process = dynamic(() => import("../components/Process"), { ssr: true });
const Differentiators = dynamic(() => import("../components/Differentiators"), { ssr: true });
const TargetClient = dynamic(() => import("../components/TargetClient"), { ssr: true });
const Testimonials = dynamic(() => import("../components/Testimonials"), { ssr: true });
const SynaplyAI = dynamic(() => import("../components/SynaplyAI"), { ssr: true });
const FAQ = dynamic(() => import("../components/FAQ"), { ssr: true });

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
      <Hero content={heroContent as import("../components/Hero").HeroContent} />
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
