"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Project {
  title: string;
  description: string;
  image: string;
  link: string;
}

export default function FeaturedWork() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch("/featured-work.json")
      .then((res) => res.json())
      .then(setProjects);
  }, []);

  return (
    <section id="work" className="relative bg-orange-50 py-16 md:py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-10 text-gray-900">Featured Work</h2>
        {/* Project grid */}
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          {projects.map((project, i) => (
            <div key={i} className="relative group rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow bg-white border border-orange-100">
              <div className="relative w-full h-56">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover object-center"
                />
              </div>
              <div className="absolute inset-0 bg-orange-500/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center text-center p-6">
                <h3 className="text-2xl font-heading font-bold text-white mb-2">{project.title}</h3>
                <p className="text-white/90 font-body mb-4">{project.description}</p>
                <Link
                  href={project.link}
                  className="px-6 py-2 rounded bg-teal-500 text-white font-semibold hover:bg-orange-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                >
                  View Case Study
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Link
            href="/portfolio"
            className="px-8 py-3 rounded bg-orange-500 text-white font-semibold text-lg hover:bg-teal-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            View All Projects
          </Link>
        </div>
      </div>
    </section>
  );
} 