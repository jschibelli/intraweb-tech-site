"use client";

import { FaCompass, FaEye, FaCheck, FaBook } from "react-icons/fa";

const brandTeal = "#1cc6b7";
const brandNavy = "#0a2236";
const brandNavyLight = "#13293d";

const values = [
  {
    title: "Implementation over advice",
    description:
      "Anyone can write a recommendation. We measure ourselves by what actually gets deployed and used.",
  },
  {
    title: "Outcomes over activity",
    description:
      "We don't bill for hours. We bill for capability delivered.",
  },
  {
    title: "Transparency over polish",
    description:
      "We'll tell you if something won't work. We'd rather lose a deal than set up a failure.",
  },
];

const milestones = [
  { year: "Stage 1", event: "Diagnostic (2–3 weeks)" },
  { year: "Stage 2", event: "Implementation retainer" },
  { year: "Ongoing", event: "Optimization & support" },
];

export default function AboutSections() {
  return (
    <div className="w-full bg-[#0a2236]">
      {/* Mission & Vision */}
      <section className="py-16 bg-[#0a2236]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:divide-x md:divide-[#1cc6b7]/20 bg-transparent rounded-lg shadow-none">
            {/* Mission */}
            <div className="flex-1 flex flex-col items-center md:items-start px-0 md:px-8 mb-12 md:mb-0">
              <div className="flex flex-col items-center w-full">
                <span className="mb-3">
                  <FaCompass size={36} style={{ color: brandTeal }} aria-hidden="true" />
                </span>
                <h2 className="font-poppins font-bold text-[2.25rem] text-center md:text-left text-[#1cc6b7] mb-6 leading-tight">
                  Our Mission
                </h2>
              </div>
              <p className="font-inter text-base md:text-lg text-[#eaf6f6] text-left w-full max-w-[600px]">
                IntraWeb Technologies exists to own the middle ground between "strategy" and "IT will figure it out." Too many AI pilots die in that gap. We focus on implementation—building systems that actually work in production, not just on paper.
              </p>
            </div>
            {/* Vision */}
            <div className="flex-1 flex flex-col items-center md:items-start px-0 md:px-8 mt-12 md:mt-0">
              <div className="flex flex-col items-center w-full">
                <span className="mb-3">
                  <FaEye size={36} style={{ color: brandTeal }} aria-hidden="true" />
                </span>
                <h2 className="font-poppins font-bold text-[2.25rem] text-center md:text-left text-[#1cc6b7] mb-6 leading-tight">
                  Our Focus
                </h2>
              </div>
              <p className="font-inter text-base md:text-lg text-[#eaf6f6] text-left w-full max-w-[600px]">
                We're not trying to scale to hundreds of consultants. We work with a small number of companies so we can deliver real capability and measurable value from their AI and workflow investments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-[#13293d]">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center mb-10">
            <span className="mb-2">
              <FaCheck size={32} style={{ color: brandTeal }} aria-hidden="true" />
            </span>
            <h2 className="font-poppins font-bold text-[2.25rem] text-center text-[#1cc6b7] mb-2 leading-tight">
              Our Values
            </h2>
          </div>
          <ul className="space-y-8">
            {values.map((value) => (
              <li key={value.title} className="flex items-start">
                <span className="mt-1 mr-4">
                  <FaCheck size={20} style={{ color: brandTeal }} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-poppins font-semibold text-lg text-[#eaf6f6] mb-1">{value.title}</h3>
                  <p className="font-inter text-base text-[#eaf6f6] leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-[#0a2236]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-start md:gap-12">
            {/* Story Text */}
            <div className="flex-1 mb-10 md:mb-0">
              <div className="flex flex-col items-center md:items-start">
                <span className="mb-3">
                  <FaBook size={36} style={{ color: brandTeal }} aria-hidden="true" />
                </span>
                <h2 className="font-poppins font-bold text-[2.25rem] text-center md:text-left text-[#1cc6b7] mb-6 leading-tight">
                  Our Capabilities
                </h2>
              </div>
              <div className="font-inter text-base md:text-lg text-[#eaf6f6] text-left space-y-5 max-w-[600px]">
                <p>
                  <strong className="text-[#1cc6b7]">15+ Years Engineering</strong> — Building production systems, not prototypes.
                </p>
                <p>
                  <strong className="text-[#1cc6b7]">Workflow Automation</strong> — Deep experience in system integration and process automation.
                </p>
                <p>
                  <strong className="text-[#1cc6b7]">SMB Focus</strong> — Based in New Jersey, working with growing companies nationally.
                </p>
              </div>
            </div>
            {/* Milestones Card */}
            <div className="flex-1 w-full max-w-md mx-auto md:mx-0">
              <div className="bg-[#13293d] rounded-lg shadow border border-[#1cc6b7]/10 p-6">
                <h3 className="font-poppins font-semibold text-lg text-[#eaf6f6] mb-4">How We Engage</h3>
                <ul className="space-y-3">
                  {milestones.map((m) => (
                    <li key={m.year} className="flex items-center">
                      <span className="font-poppins font-bold text-[#1cc6b7] mr-3 min-w-[56px]">{m.year}</span>
                      <span className="font-inter text-[#eaf6f6]">{m.event}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 