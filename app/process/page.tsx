"use client";
import { CheckCircle, Search, Pen, Code, Rocket, LifeBuoy, User, ClipboardList, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import EntranceReveal from "@/components/ui/EntranceReveal";

const steps = [
  { icon: Search, title: "Current workflow mapping", description: "Where time actually goes—not where people think it goes." },
  { icon: Pen, title: "Tool audit", description: "What you have versus what you actually use." },
  { icon: Code, title: "Integration assessment", description: "What can talk to what, and what's missing." },
  { icon: Rocket, title: "Automation opportunity scoring", description: "Effort versus impact matrix for every candidate workflow." },
  { icon: LifeBuoy, title: "90-day implementation sequence", description: "Prioritized roadmap you can act on immediately." },
];

const benefits = [
  "Workflow design & build—we architect and construct the automation sequences",
  "Agent configuration with proper guardrails and handoffs",
  "Integration development so data flows automatically",
  "Exception handling when automation fails or edge cases appear",
  "Documentation so your team can maintain and extend it",
];

export default function ProcessPage() {
  const [containerSize, setContainerSize] = useState(400);
  useEffect(() => {
    function handleResize() {
      const width = Math.min(Math.max(window.innerWidth * 0.95, 220), 700);
      setContainerSize(width);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cardWidth = containerSize * 0.30;
  const cardHeight = containerSize * 0.12;
  const iconSize = cardHeight * 0.5;
  const headingFontSize = `clamp(0.7rem,${cardHeight * 0.35}px,0.9rem)`;
  const accentBarWidth = 4;
  const nodeBorderRadius = 8;
  const clientCenterX = containerSize / 2;
  const clientCenterY = containerSize / 2;
  const radius = containerSize * 0.36;
  const processCenters = Array.from({ length: 5 }).map((_, i) => {
    const angle = (-90 + i * 72) * (Math.PI / 180);
    return [
      clientCenterX + radius * Math.cos(angle),
      clientCenterY + radius * Math.sin(angle),
    ];
  });

  function getCenterCardEdgePoint(
    cx: number,
    cy: number,
    px: number,
    py: number,
    halfW: number,
    halfH: number
  ) {
    const dx = px - cx;
    const dy = py - cy;
    if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) return { x: cx, y: cy };
    const t = Math.min(halfW / Math.max(Math.abs(dx), 1e-6), halfH / Math.max(Math.abs(dy), 1e-6));
    return {
      x: cx + dx * t,
      y: cy + dy * t,
    };
  }

  const heroWeb = (() => {
    const cx = 600;
    const cy = 200;
    const rx = 600;
    const ry = 200;
    const numRadials = 36;
    const radialLines: [[number, number], [number, number]][] = [];
    for (let i = 0; i < numRadials; i++) {
      const a = (i / numRadials) * 2 * Math.PI - Math.PI / 2;
      radialLines.push([
        [cx, cy],
        [cx + rx * Math.cos(a), cy + ry * Math.sin(a)],
      ]);
    }
    const ringRadii = [0.2, 0.35, 0.5, 0.65, 0.8, 1];
    return { cx, cy, rx, ry, radialLines, ringRadii };
  })();

  return (
    <main className="bg-gray-900 text-white min-h-screen">
      <EntranceReveal>
      <section className="page-hero bg-gradient-to-br from-teal-500 via-blue-500 to-indigo-600 text-white text-center">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1200 400"
          preserveAspectRatio="xMidYMid slice"
          style={{ zIndex: 0 }}
        >
          {heroWeb.ringRadii.map((r, i) => (
            <ellipse
              key={`ring-${i}`}
              cx={heroWeb.cx}
              cy={heroWeb.cy}
              rx={heroWeb.rx * r}
              ry={heroWeb.ry * r}
              fill="none"
              stroke="rgba(255,255,255,0.95)"
              strokeWidth={1}
              className="hero-web-line hero-web-pulse"
              style={{ animationDelay: `${i * 0.06}s` }}
            />
          ))}
          {heroWeb.radialLines.map(([[x1, y1], [x2, y2]], i) => (
            <line
              key={`radial-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              fill="none"
              stroke="rgba(255,255,255,0.95)"
              strokeWidth={1}
              className="hero-web-line hero-web-pulse"
              style={{ animationDelay: `${0.25 + i * 0.015}s` }}
            />
          ))}
        </svg>
        <div className="page-hero-content relative z-10 max-w-3xl mx-auto px-4">
          <h1 className="page-hero-heading text-left md:text-center">How We Work</h1>
          <p className="page-hero-subheading font-body mb-6 text-left md:text-center">Two-stage engagement: diagnostic followed by implementation retainer. Fixed scope, clear deliverables, no ambiguity.</p>
        </div>
      </section>
      </EntranceReveal>
      <EntranceReveal>
      <section className="py-8 md:py-16 relative overflow-visible">
        <div className="relative mx-auto" style={{ width: containerSize, height: containerSize, minHeight: containerSize, maxWidth: '100%' }}>
          <svg
            width={containerSize}
            height={containerSize}
            viewBox={`0 0 ${containerSize} ${containerSize}`}
            className="absolute top-0 left-0 w-full h-full pointer-events-none select-none"
            style={{ zIndex: 1 }}
          >
            {processCenters.map(([x, y], i) => {
              const start = getCenterCardEdgePoint(
                clientCenterX,
                clientCenterY,
                x,
                y,
                cardWidth / 2,
                cardHeight / 2
              );
              const end = getCenterCardEdgePoint(
                x,
                y,
                clientCenterX,
                clientCenterY,
                cardWidth / 2,
                cardHeight / 2
              );
              const r = 4;
              return (
                <g key={i}>
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="#6b7280"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                  <circle cx={start.x} cy={start.y} r={r} fill="#1f2937" stroke="#6b7280" strokeWidth={1.5} />
                  <circle cx={end.x} cy={end.y} r={r} fill="#1f2937" stroke="#6b7280" strokeWidth={1.5} />
                </g>
              );
            })}
          </svg>
          <div
            className="absolute flex items-center z-10 overflow-hidden"
            style={{
              left: clientCenterX - cardWidth / 2,
              top: clientCenterY - cardHeight / 2,
              width: cardWidth,
              height: cardHeight,
              background: '#1f2937',
              border: '1px solid #374151',
              borderRadius: nodeBorderRadius,
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ width: accentBarWidth, height: '100%', background: '#F97316', flexShrink: 0 }} />
            <span className="flex flex-shrink-0 items-center justify-center ml-2" style={{ width: cardHeight - 10, height: cardHeight - 10, background: '#F97316', borderRadius: 6 }}>
              <User size={iconSize} color="#fff" />
            </span>
            <span className="font-semibold text-white truncate ml-2 mr-3" style={{ fontSize: headingFontSize, lineHeight: 1.2 }}>Client</span>
          </div>
          {processCenters.map(([x, y], i) => {
            const step = steps[i];
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="absolute flex items-center z-10 overflow-hidden"
                style={{
                  left: x - cardWidth / 2,
                  top: y - cardHeight / 2,
                  width: cardWidth,
                  minWidth: cardWidth,
                  height: cardHeight,
                  minHeight: cardHeight,
                  background: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: nodeBorderRadius,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              >
                <div style={{ width: accentBarWidth, height: '100%', background: '#15B8A1', flexShrink: 0 }} />
                <span className="flex flex-shrink-0 items-center justify-center ml-2" style={{ width: cardHeight - 10, height: cardHeight - 10, background: '#15B8A1', borderRadius: 6 }}>
                  <Icon size={iconSize} color="#fff" />
                </span>
                <span className="font-semibold text-white ml-2 mr-3 flex-1 min-w-0 line-clamp-2" style={{ fontSize: headingFontSize, lineHeight: 1.2 }} title={step.title}>{step.title}</span>
              </div>
            );
          })}
        </div>
      </section>
      </EntranceReveal>
      <EntranceReveal>
      <section className="py-12 md:py-20 bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6 text-white text-left md:text-center">What the Retainer Includes</h2>
          <ul className="grid gap-5 md:grid-cols-2 text-left max-w-2xl mx-auto mb-8">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-4 text-gray-200">
                <CheckCircle className="text-teal-400 mt-1 flex-shrink-0" size={iconSize} />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      </EntranceReveal>
      <EntranceReveal>
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-white text-left md:text-center">Focused on Delivery, Not Volume</h2>
          <p className="text-lg text-gray-300 mb-10 text-left md:text-center max-w-3xl md:mx-auto">We prioritize depth and follow-through over stacking projects. You get clear timelines, direct access, and work that’s built to last. If our capacity affects your start date, we say so up front—no surprises.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <article className="relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700 shadow-lg">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500" aria-hidden />
              <div className="p-6 md:p-8 pl-7 md:pl-9">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-500/20 text-teal-400">
                    <ClipboardList size={22} />
                  </span>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Stage 1</span>
                    <h3 className="text-xl font-heading font-bold text-white">Agent Readiness Diagnostic</h3>
                  </div>
                </div>
                <p className="text-gray-300 text-base leading-relaxed text-justify">
                  2–3 weeks. We map your workflows, score automation opportunities, and deliver a prioritized roadmap with effort/impact scoring. No obligation to continue—you get a clear picture and decide next steps.
                </p>
              </div>
            </article>
            <article className="relative overflow-hidden rounded-xl bg-gray-800 border border-gray-700 shadow-lg">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" aria-hidden />
              <div className="p-6 md:p-8 pl-7 md:pl-9">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500/20 text-orange-500">
                    <Wrench size={22} />
                  </span>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Stage 2</span>
                    <h3 className="text-xl font-heading font-bold text-white">Implementation Retainer</h3>
                  </div>
                </div>
                <p className="text-gray-300 text-base leading-relaxed text-justify">
                  Hands-on workflow build and deployment. Weekly syncs plus async support. Scope is defined by the diagnostic findings so you know exactly what's in and what's next.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>
      </EntranceReveal>
    </main>
  );
} 