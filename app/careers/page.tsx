import React from 'react';
import EntranceReveal from "@/components/ui/EntranceReveal";

const CareersPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <EntranceReveal>
        <section className="page-hero" style={{ backgroundImage: "url(/circuit-pattern.svg)", backgroundRepeat: "repeat", backgroundSize: "auto" }}>
          <div className="page-hero-content max-w-7xl mx-auto px-4 text-center">
            <h1 className="page-hero-heading">Careers at IntraWeb Technologies</h1>
            <p className="page-hero-subheading max-w-3xl mx-auto">Join our team and help us innovate, build, and empower businesses worldwide.</p>
          </div>
        </section>
      </EntranceReveal>
      <EntranceReveal>
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-gray-800 p-8 rounded shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-orange-500">Available Positions</h2>
            <p className="text-gray-300">We currently have no open positions, but we are always looking for talented individuals to join our team. Please check back later or send your resume to <a href="mailto:careers@intrawebtech.com" className="text-orange-500 hover:underline">careers@intrawebtech.com</a>.</p>
          </div>
        </div>
      </EntranceReveal>
    </div>
  );
};

export default CareersPage; 