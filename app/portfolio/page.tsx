import { Project } from "@/types/project";
import Link from "next/link";
import projectsData from "@/data/projects.json";
import ProjectCard from "@/components/portfolio/ProjectCard";
import EntranceReveal from "@/components/ui/EntranceReveal";

export default function PortfolioPage() {
  return (
    <main className="bg-[#0a2236] min-h-screen">
      {/* Hero Section */}
      <EntranceReveal>
        <section className="page-hero bg-[#0a2236]">
          {/* Pentagon pattern background */}
          <div className="absolute inset-0 z-0 pointer-events-none select-none" style={{ backgroundImage: 'url(/pentagon-pattern.svg)', backgroundRepeat: 'repeat', backgroundSize: '80px 80px', opacity: 0.18 }} />
          <div className="page-hero-content relative z-10 max-w-6xl mx-auto px-4 flex flex-col items-center">
            <h1 className="page-hero-heading text-center drop-shadow-lg">
              Our Portfolio
            </h1>
            <p className="page-hero-subheading text-center max-w-2xl mb-14 font-body">
              Explore our successful projects and see how we combine human expertise with AI capabilities to deliver exceptional results.
            </p>
          </div>
        </section>
      </EntranceReveal>

      {/* Projects Grid */}
      <EntranceReveal>
        <section className="py-20 md:py-28">
          <div className="max-w-6xl mx-auto px-4">
            <div className="w-full grid gap-8 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 mb-16">
              {projectsData.projects.map((project) => (
                <ProjectCard key={project.id} project={project} variant="dark" />
              ))}
            </div>
          </div>
        </section>
      </EntranceReveal>
    </main>
  );
} 