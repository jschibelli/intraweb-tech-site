"use client";

import Link from "next/link";
import Image from "next/image";
import projectsData from "@/data/projects.json";
import { Code, Cloud, Sparkles, Briefcase, HeartPulse, BarChart3 } from "lucide-react";
import { useState } from "react";

const industryIconMap: Record<string, React.ElementType> = {
  eCommerce: Code,
  Healthcare: HeartPulse,
  Finance: BarChart3,
  Cloud: Cloud,
  AI: Sparkles,
};

const ProjectCard = ({ project }: { project: typeof projectsData.projects[0] }) => {
  const Icon = industryIconMap[project.industry] || Briefcase;
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-[#101828] rounded-2xl shadow-2xl flex flex-col overflow-hidden group transition-transform hover:-translate-y-1 hover:shadow-3xl duration-200 border border-[#232e47]">
      {/* Project image or icon fallback */}
      <div className="relative w-full aspect-[16/9] bg-gray-900 flex items-center justify-center">
        {project.heroImage && !imgError ? (
          <Image
            src={project.heroImage}
            alt={project.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="flex items-center justify-center w-full h-full">
            <Icon size={72} className="text-teal-400" />
          </span>
        )}
        {project.aiContribution && (
          <span className="absolute top-4 left-4 bg-indigo-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md tracking-wide uppercase">
            AI-ENHANCED
          </span>
        )}
      </div>
      {/* Card content */}
      <div className="flex-1 flex flex-col justify-between p-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 leading-tight">
            {project.name}
          </h3>
          <p className="text-sm text-teal-400 mb-2 font-medium">{project.industry}</p>
        </div>
        <div className="mt-4 mb-2">
          <span className="text-base font-semibold text-teal-300">
            {project.keyMetric}
          </span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <Link
            href={`/portfolio/${project.slug}`}
            className="text-sm font-semibold text-teal-400 hover:underline transition-colors"
          >
            View case
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function FeaturedWorkSection() {
  const projects = projectsData.projects.slice(0, 3);
  return (
    <section className="relative py-24 md:py-32 bg-[#0a2236] overflow-hidden">
      {/* Pentagon pattern background, same as team page */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none" style={{ backgroundImage: 'url(/pentagon-pattern.svg)', backgroundRepeat: 'repeat', backgroundSize: '80px 80px', opacity: 0.18 }} />
      <div className="relative z-10 max-w-6xl mx-auto px-4 flex flex-col items-center">
        <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-white text-center mb-6 tracking-tight drop-shadow-lg">
          Featured Work
        </h2>
        <p className="text-lg md:text-xl text-blue-100 text-center max-w-2xl mb-14 font-body">
          Explore our portfolio of successful projects, showcasing our expertise in building innovative solutions with a hybrid <span className="text-teal-400 font-semibold">human + AI</span> approach.
        </p>
        <div className="w-full grid gap-8 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 mb-16">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        <Link
          href="/portfolio"
          className="inline-flex items-center justify-center px-10 py-4 rounded-md bg-orange-500 text-white text-lg font-bold shadow-lg hover:bg-teal-500 transition-colors focus:outline-none focus:ring-4 focus:ring-orange-300"
        >
          View All Projects
        </Link>
      </div>
    </section>
  );
} 