"use client";
import { CheckCircle, Search, Pen, Code, Rocket, LifeBuoy, User } from "lucide-react";
import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const steps = [
  {
    icon: Search,
    title: "Discovery",
    description: "We start by understanding your business goals, challenges, and requirements. This phase includes stakeholder interviews, research, and project scoping to ensure alignment from day one.",
  },
  {
    icon: Pen,
    title: "Design",
    description: "Our design team creates wireframes, prototypes, and high-fidelity mockups. We focus on user experience, accessibility, and visual appeal, iterating with your feedback.",
  },
  {
    icon: Code,
    title: "Development",
    description: "We build robust, scalable solutions using modern technologies. Our agile process includes regular demos, code reviews, and continuous integration for quality and transparency.",
  },
  {
    icon: Rocket,
    title: "Launch",
    description: "After thorough testing and QA, we deploy your solution to production. We handle all aspects of launch, from infrastructure setup to go-live support, ensuring a smooth rollout.",
  },
  {
    icon: LifeBuoy,
    title: "Support",
    description: "Post-launch, we provide ongoing support, monitoring, and optimization. Our team is available for updates, troubleshooting, and new feature development as your needs evolve.",
  },
];

const benefits = [
  "Clear communication and transparency at every stage",
  "User-centered design and agile development",
  "Rapid prototyping and iterative feedback",
  "Scalable, secure, and maintainable solutions",
  "Dedicated post-launch support and partnership",
];

interface Project {
  name: string;
  summary: string;
}

interface ProcessClientProps {
  project: Project;
}

export default function ProcessClient({ project }: ProcessClientProps) {
  // Responsive geometry for both desktop and mobile
  const [containerSize, setContainerSize] = useState(400);
  useEffect(() => {
    function handleResize() {
      // For all screens: 95vw up to 700px
      const width = Math.min(Math.max(window.innerWidth * 0.95, 220), 700);
      setContainerSize(width);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Geometry as fractions of container size
  const cardWidth = containerSize * 0.22; // square cards
  const cardHeight = cardWidth;
  const iconCircle = cardWidth * 0.36; // round icon background
  const iconSize = iconCircle * 0.6; // icon inside the circle
  const headingFontSize = `clamp(0.85rem,${cardWidth * 0.13}px,1.05rem)`;
  const clientCenterX = containerSize / 2;
  const clientCenterY = containerSize / 2;
  const radius = containerSize * 0.32; // tight pentagon
  const processCenters = Array.from({ length: 5 }).map((_, i) => {
    const angle = (-90 + i * 72) * (Math.PI / 180);
    return [
      clientCenterX + radius * Math.cos(angle),
      clientCenterY + radius * Math.sin(angle),
    ];
  });
  const polygonPointsStr = processCenters.map(([x, y]) => `${x},${y}`).join(' ');

  function getEdgePoint(cx: number, cy: number, px: number, py: number, cardSize: number) {
    const dx = px - cx;
    const dy = py - cy;
    const half = cardSize / 2;
    // Find scale to reach the edge of the square
    const scale = half / Math.max(Math.abs(dx), Math.abs(dy));
    return {
      x: cx + dx * scale,
      y: cy + dy * scale,
    };
  }

  return (
    <main className="bg-gray-900 text-white min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-teal-500 via-blue-500 to-indigo-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-teal-200">Our Process</p>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">{project.name}</h1>
          <p className="text-lg md:text-2xl font-body mb-6 text-white/90">{project.summary}</p>
        </div>
      </section>
      {/* Pentagon Layout: Always visible, responsive size, prominent on mobile */}
      <section className="py-8 md:py-16 relative overflow-visible">
        <div className="relative mx-auto" style={{ width: containerSize, height: containerSize, maxWidth: '100%' }}>
          {/* SVG: Pentagon and lines */}
          <svg
            width={containerSize}
            height={containerSize}
            viewBox={`0 0 ${containerSize} ${containerSize}`}
            className="absolute top-0 left-0 w-full h-full pointer-events-none select-none"
            style={{ zIndex: 1 }}
          >
            {processCenters.map(([x, y], i) => {
              const edge = getEdgePoint(clientCenterX, clientCenterY, x, y, cardWidth);
              return (
                <line
                  key={i}
                  x1={edge.x}
                  y1={edge.y}
                  x2={x}
                  y2={y}
                  stroke="#15B8A1"
                  strokeWidth={containerSize * 0.008}
                  opacity="0.7"
                />
              );
            })}
          </svg>
          {/* Center card for Client */}
          <div
            className="absolute flex flex-col items-center justify-center text-center bg-[#181F2A] rounded-[18px] shadow-lg z-10"
            style={{
              left: clientCenterX - cardWidth / 2,
              top: clientCenterY - cardHeight / 2,
              width: cardWidth,
              height: cardHeight,
              boxShadow: '0 0 32px 0 #F9731688, 0 0 0 3px #F97316',
              border: '1px solid #F97316',
              aspectRatio: '1 / 1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="flex items-center justify-center rounded-full shadow-md mb-3" style={{ width: iconCircle, height: iconCircle, background: '#F97316', aspectRatio: '1 / 1' }}>
              <User size={iconSize} color="#fff" />
            </span>
            <h3 className="font-heading font-bold mb-0 text-white text-center whitespace-nowrap" style={{ fontSize: headingFontSize, marginTop: 2, letterSpacing: 0.2, lineHeight: 1.1 }}>Client</h3>
          </div>
          {/* Process cards at each vertex */}
          {processCenters.map(([x, y], i) => {
            const step = steps[i];
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="absolute flex flex-col items-center justify-center text-center bg-[#181F2A] rounded-[18px] shadow-lg z-10"
                style={{
                  left: x - cardWidth / 2,
                  top: y - cardHeight / 2,
                  width: cardWidth,
                  height: cardHeight,
                  boxShadow: '0 0 32px 0 #15B8A188, 0 0 0 3px #15B8A1',
                  border: '1px solid #15B8A1',
                  aspectRatio: '1 / 1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span className="flex items-center justify-center rounded-full shadow-md mb-3" style={{ width: iconCircle, height: iconCircle, background: '#15B8A1', aspectRatio: '1 / 1' }}>
                  <Icon size={iconSize} color="#fff" />
                </span>
                <h3 className="font-heading font-bold mb-0 text-white text-center whitespace-nowrap" style={{ fontSize: headingFontSize, marginTop: 2, letterSpacing: 0.2, lineHeight: 1.1 }}>{step.title}</h3>
              </div>
            );
          })}
        </div>
      </section>
      {/* Benefits Section */}
      <section className="py-12 md:py-20 bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">Why Our Process Works</h2>
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
      {/* Example/Case Study Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Process in Action: E-Commerce Platform Launch</h2>
          <p className="text-lg text-gray-300 mb-8">See how our process helped a client launch a scalable e-commerce platform, from initial discovery to post-launch support.</p>
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700 text-left">
            <ol className="list-decimal list-inside space-y-3 text-gray-200">
              <li><b>Discovery:</b> Conducted stakeholder interviews and market research to define requirements and success metrics.</li>
              <li><b>Design:</b> Delivered interactive Figma prototypes and iterated based on client feedback.</li>
              <li><b>Development:</b> Built a full-stack Next.js app with real-time inventory and secure checkout.</li>
              <li><b>Launch:</b> Deployed to scalable cloud infrastructure with zero downtime.</li>
              <li><b>Support:</b> Provided ongoing monitoring, feature updates, and analytics reporting.</li>
            </ol>
          </div>
        </div>
      </section>
    </main>
  );
} 