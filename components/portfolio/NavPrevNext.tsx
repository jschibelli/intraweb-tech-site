"use client";

import { Project } from "@/types/project";
import Link from "next/link";


interface NavPrevNextProps {
  project: Project;
}

export default function NavPrevNext({ project }: NavPrevNextProps) {
  return (
    <section className="py-4 bg-[#0a2236] border-t border-teal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link
            href={`/portfolio/${project.navigation.previousSlug}`}
            className="px-6 py-3 rounded-md bg-orange-500 text-white font-semibold hover:bg-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            ← Previous
          </Link>

          <Link
            href="/portfolio"
            className="text-teal-400 hover:text-orange-400 transition-colors"
          >
            All Projects
          </Link>

          <Link
            href={`/portfolio/${project.navigation.nextSlug}`}
            className="px-6 py-3 rounded-md bg-orange-500 text-white font-semibold hover:bg-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Next →
          </Link>
        </div>
      </div>
    </section>
  );
} 