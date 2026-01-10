"use client";
import Image from "next/image";
import { Brain } from "lucide-react";

import { TeamProcess } from "./team-process";

const team = [
  {
    name: "John Schibelli",
    title: "Founder / CEO",
    image: "/john_schibelli.jpg",
    bio: "John provides strategic vision, product direction, and final approvals for all projects. He is passionate about building innovative solutions that drive business growth.",
  },
  {
    name: "Alex Reyes",
    title: "Project Manager",
    image: "/alex_reyes.png",
    bio: "Alex coordinates cross-functional teams, manages timelines, and ensures seamless task execution from start to finish.",
  },
  {
    name: "Nico Alvarez",
    title: "Frontend Lead",
    image: "/nico.png",
    bio: "Nico leads UI implementation, component architecture, and ensures responsive, accessible interfaces across all platforms.",
  },
  {
    name: "Eli Noor",
    title: "Backend Lead",
    image: "/eli-noor.png",
    bio: "Eli designs robust databases, develops API endpoints, and handles authentication and multi-tenant logic.",
  },
  {
    name: "Aria Das",
    title: "AI/ML Lead",
    image: "/Aria_das.png",
    bio: "Aria integrates custom AI models, manages token state logic, and develops agent workflows for intelligent automation.",
  },
  {
    name: "Sophie Tran",
    title: "UX/UI Lead",
    image: "/sophie_tran.png",
    bio: "Sophie crafts visual design, UX flows, and Figma mockups, ensuring every product is beautiful and user-friendly.",
  },
];

export default function TeamPage() {


  return (
    <main className="bg-gray-900 text-white min-h-screen">
      {/* Team Hero Section */}
      <section className="relative overflow-hidden text-white pt-16 pb-12 md:pt-24 md:pb-20" style={{ backgroundColor: '#0a2236', backgroundImage: 'url(/pentagon-pattern.svg)', backgroundRepeat: 'repeat', backgroundSize: '80px 80px' }}>
        {/* Top inside shadow */}
        <div className="absolute top-0 left-0 w-full h-10 md:h-16 pointer-events-none select-none" style={{ boxShadow: 'inset 0 16px 32px -8px #0008' }} />
        {/* Bottom inside shadow */}
        <div className="absolute bottom-0 left-0 w-full h-10 md:h-16 pointer-events-none select-none" style={{ boxShadow: 'inset 0 -16px 32px -8px #0008' }} />
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center px-4">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">Meet the IntraWeb Team</h1>
          <p className="text-lg md:text-2xl font-body mb-8 text-white/90">
            We&apos;re a hybrid team of expert professionals and AI-powered agents, collaborating to deliver cutting-edge digital experiences.<br />
            Every AI agent is built with purpose and precision, and every human lead ensures our solutions stay aligned with your goals.
          </p>
        </div>
      </section>
      {/* Team Section */}
      <section className="max-w-6xl mx-auto px-4 pt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {team.map((member) => (
            <div key={member.name} className="bg-gray-800 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center border border-gray-700 relative overflow-visible">
              <div className="relative w-40 h-40 mb-6 rounded-full overflow-visible flex items-center justify-center">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-teal-400 bg-gray-700">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={160}
                    height={160}
                    className="object-cover w-full h-full"
                    style={{ objectPosition: 'top' }}
                    unoptimized
                  />
                </div>
                {member.name !== "John Schibelli" && (
                  <span
                    className="absolute bg-teal-700 border rounded-full p-1 flex items-center justify-center shadow-lg group"
                    style={{ right: '5px', bottom: 0, width: 44, height: 44, borderColor: '#2dd4bf', borderWidth: 1 }}
                  >
                    <span className="relative flex items-center">
                      <Brain size={24} className="text-teal-300 cursor-pointer" stroke="#2dd4bf" strokeWidth={1} />
                      <span className="absolute left-1/2 bottom-full mb-2 w-64 -translate-x-1/2 scale-0 group-hover:scale-100 group-focus-within:scale-100 transition-transform origin-bottom bg-white text-gray-900 text-xs rounded-lg shadow-lg p-3 z-50">
                        AI Agents are intelligent, task-specific digital collaborators developed in-house by IntraWeb Technologies. They assist in design, engineering, strategy, and operations—always working under the direction of human leadership.
                      </span>
                    </span>
                  </span>
                )}
              </div>
              <h3 className="text-3xl font-heading font-bold mb-1">{member.name}</h3>
              <p className="text-teal-400 font-semibold text-xl mb-3">{member.title}</p>
              <p className="text-gray-300 text-lg font-body">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>
      {/* CTA Section */}
      <section className="text-center mt-20 py-12 bg-gradient-to-r from-[#0a2236] to-[#181f2a]">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-2">Want to collaborate with our hybrid team?</h2>
          <p className="text-gray-300 mb-4">We&apos;re ready to build, scale, and launch—together.</p>
          <a href="/contact" className="inline-block px-8 py-3 rounded bg-teal-500 hover:bg-orange-500 text-white font-semibold text-lg shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
            Get In Touch
          </a>
        </div>
      </section>
      {/* Team Process Section */}
      <TeamProcess />
    </main>
  );
} 