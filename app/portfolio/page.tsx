import projectsData from "@/data/projects.json";
import ProjectCard from "@/components/portfolio/ProjectCard";

export default function PortfolioPage() {
  return (
    <main className="bg-[#0a2236] min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 bg-[#0a2236] overflow-hidden">
        {/* Pentagon pattern background */}
        <div className="absolute inset-0 z-0 pointer-events-none select-none" style={{ backgroundImage: 'url(/pentagon-pattern.svg)', backgroundRepeat: 'repeat', backgroundSize: '80px 80px', opacity: 0.18 }} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-white text-center mb-6 drop-shadow-lg">
            Our Portfolio
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 text-center max-w-2xl mb-14 font-body">
            Explore our successful projects and see how we combine human expertise with AI capabilities to deliver exceptional results.
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <div className="w-full grid gap-8 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 mb-16">
            {projectsData.projects.map((project) => (
              <ProjectCard key={project.id} project={project} variant="dark" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
} 