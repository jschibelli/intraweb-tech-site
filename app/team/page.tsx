"use client";
import Image from "next/image";
import { useState } from "react";
import { TeamProcess } from "./team-process";
import EntranceReveal from "@/components/ui/EntranceReveal";

const team = [
  {
    name: "John Schibelli",
    title: "Founder / CEO",
    image: "/john_schibelli.jpg",
    bio: "John provides strategic vision, product direction, and final approvals for all projects. He is passionate about building innovative solutions that drive business growth.",
  },
  {
    name: "Chris Weston",
    title: "Senior Software Engineer",
    image: "/ctw_bio_photo.png",
    bio: "Chris architects scalable systems, drives full-stack development, and brings deep engineering expertise to every project.",
  },
];

export default function TeamPage() {
  const [showAgentModal, setShowAgentModal] = useState(false);
  const openAgentModal = () => setShowAgentModal(true);
  const closeAgentModal = () => setShowAgentModal(false);

  return (
    <main className="bg-gray-900 text-white min-h-screen">
      {/* Team Hero Section */}
      <EntranceReveal>
        <section className="page-hero text-white" style={{ backgroundColor: '#0a2236', backgroundImage: 'url(/pentagon-pattern.svg)', backgroundRepeat: 'repeat', backgroundSize: '80px 80px' }}>
          {/* Top inside shadow */}
          <div className="absolute top-0 left-0 w-full h-10 md:h-16 pointer-events-none select-none" style={{boxShadow: 'inset 0 16px 32px -8px #0008'}} />
          {/* Bottom inside shadow */}
          <div className="absolute bottom-0 left-0 w-full h-10 md:h-16 pointer-events-none select-none" style={{boxShadow: 'inset 0 -16px 32px -8px #0008'}} />
          <div className="page-hero-content relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center px-4">
            <h1 className="page-hero-heading">Meet the IntraWeb Team</h1>
            <p className="page-hero-subheading font-body mb-8">
              We're a hybrid team of expert professionals and AI-powered agents, collaborating to deliver cutting-edge digital experiences.<br />
              Every AI agent is built with purpose and precision, and every human lead ensures our solutions stay aligned with your goals.
            </p>
          </div>
        </section>
      </EntranceReveal>
      {/* Team Section */}
      <EntranceReveal>
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
                </div>
                <h3 className="text-3xl font-heading font-bold mb-1">{member.name}</h3>
                <p className="text-teal-400 font-semibold text-xl mb-3">{member.title}</p>
                <p className="text-gray-300 text-lg font-body">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>
      </EntranceReveal>
      {/* CTA Section */}
      <EntranceReveal>
        <section className="text-center mt-20 py-12 bg-gradient-to-r from-[#0a2236] to-[#181f2a]">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-white mb-2">Want to collaborate with our hybrid team?</h2>
            <p className="text-gray-300 mb-4">We're ready to build, scale, and launch—together.</p>
            <a href="/contact" className="inline-block px-8 py-3 rounded bg-teal-500 hover:bg-orange-500 text-white font-semibold text-lg shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
              Get In Touch
            </a>
          </div>
        </section>
      </EntranceReveal>
      {/* Team Process Section */}
      <EntranceReveal>
        <TeamProcess />
      </EntranceReveal>
    </main>
  );
} 