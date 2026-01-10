"use client";

import { FaCompass, FaEye, FaCheck, FaBook } from "react-icons/fa";

const brandTeal = "#1cc6b7";


const values = [
  {
    title: "Innovation",
    description:
      "We relentlessly explore new ideas and technologies to deliver smarter, faster solutions.",
  },
  {
    title: "Craftsmanship",
    description:
      "We sweat the details—from code architecture to pixel-perfect design—because excellence lives in the smallest decisions.",
  },
  {
    title: "Collaboration",
    description:
      "We believe that human insight and AI potential together create the strongest outcomes.",
  },
  {
    title: "Integrity",
    description:
      "We build trust through transparency, respect deadlines, and honor our commitments.",
  },
  {
    title: "Customer Success",
    description:
      "We measure our success by yours—your goals become our north star from day one.",
  },
];

const milestones = [
  { year: "2020", event: "Company Founded" },
  { year: "2022", event: "AI Integration Strategy" },
  { year: "2024", event: "Hybrid Team Launch" },
  { year: "2025", event: "SynaplyAI Beta" },
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
                  Mission
                </h2>
              </div>
              <p className="font-inter text-base md:text-lg text-[#eaf6f6] text-left w-full max-w-[600px]">
                To empower startups and enterprises with high-performance web solutions that blend innovative design and rock-solid technology, so every digital experience we build drives real business impact.
              </p>
            </div>
            {/* Vision */}
            <div className="flex-1 flex flex-col items-center md:items-start px-0 md:px-8 mt-12 md:mt-0">
              <div className="flex flex-col items-center w-full">
                <span className="mb-3">
                  <FaEye size={36} style={{ color: brandTeal }} aria-hidden="true" />
                </span>
                <h2 className="font-poppins font-bold text-[2.25rem] text-center md:text-left text-[#1cc6b7] mb-6 leading-tight">
                  Vision
                </h2>
              </div>
              <p className="font-inter text-base md:text-lg text-[#eaf6f6] text-left w-full max-w-[600px]">
                To lead the future of web collaboration by harnessing AI-driven workflows and real-time interfaces, making seamless, intelligent digital experiences the new standard for every organization.
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
              Values
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
                  Our Story
                </h2>
              </div>
              <div className="font-inter text-base md:text-lg text-[#eaf6f6] text-left space-y-5 max-w-[600px]">
                <p>
                  IntraWeb Technologies was founded in 2020 with a simple mission: bring enterprise-grade web experiences within reach of startups and established organizations alike.
                </p>
                <p>
                  As AI capabilities began to accelerate and market demands shifted toward more intelligent workflows, we hit pause to rethink our approach—seeking a way to fuse human expertise with emerging AI potential.
                </p>
                <p>
                  In 2024, we relaunched with a renewed focus on AI-powered collaboration, assembling a hybrid team of expert designers, engineers, and proprietary AI agents to innovate faster and smarter.
                </p>
              </div>
            </div>
            {/* Milestones Card */}
            <div className="flex-1 w-full max-w-md mx-auto md:mx-0">
              <div className="bg-[#13293d] rounded-lg shadow border border-[#1cc6b7]/10 p-6">
                <h3 className="font-poppins font-semibold text-lg text-[#eaf6f6] mb-4">Key Milestones</h3>
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