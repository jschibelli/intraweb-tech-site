import { notFound } from "next/navigation";
import type { Metadata } from "next";
import projectsData from "@/data/projects.json";
import ProblemSolution from "@/components/portfolio/ProblemSolution";
import ProcessTimeline from "@/components/portfolio/ProcessTimeline";
import ResultsHighlights from "@/components/portfolio/ResultsHighlights";
import TeamComposition from "@/components/portfolio/TeamComposition";
import ClientTestimonial from "@/components/portfolio/ClientTestimonial";
import ContactCTA from "@/components/portfolio/ContactCTA";
import NavPrevNext from "@/components/portfolio/NavPrevNext";
import Image from "next/image";
import EntranceReveal from "@/components/ui/EntranceReveal";

export async function generateStaticParams() {
  return projectsData.projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projectsData.projects.find((p) => p.slug === slug);

  if (!project) {
    return {
      title: "Portfolio Project",
      description: "View our portfolio project details",
      alternates: {
        canonical: `/portfolio/${slug}`,
      },
    };
  }

  return {
    title: `${project.name} Case Study`,
    description: project.summary,
    alternates: {
      canonical: `/portfolio/${project.slug}`,
    },
    openGraph: {
      title: `${project.name} Case Study`,
      description: project.summary,
      type: "article",
      url: `https://intrawebtech.com/portfolio/${project.slug}`,
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projectsData.projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="bg-[#0a2236] min-h-screen">
      {/* Hero Section with pentagon pattern and navy background */}
      <EntranceReveal>
        <section className="page-hero bg-[#0a2236]">
          <div className="absolute inset-0 z-0 pointer-events-none select-none" style={{ backgroundImage: 'url(/pentagon-pattern.svg)', backgroundRepeat: 'repeat', backgroundSize: '80px 80px', opacity: 0.18 }} />
          <div className="page-hero-content relative z-10 max-w-6xl mx-auto px-4 flex flex-col items-center">
            <div className="flex items-center gap-4 mb-6">
              <Image
                src={project.client.logo || "/images/clients/placeholder.png"}
                alt={project.client.name}
                width={80}
                height={80}
                className="rounded-lg bg-white p-2 shadow"
              />
              <span className="text-white/80 text-xl font-medium">{project.client.name}</span>
            </div>
            <h1 className="page-hero-heading text-center drop-shadow-lg">
              {project.name}
            </h1>
            <p className="page-hero-subheading text-center max-w-2xl mb-8 font-body">
              {project.summary}
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-6">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-white/10 text-white rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
            {project.aiContribution && (
              <div className="mt-4 p-4 bg-indigo-600/20 border border-indigo-500/30 rounded-lg max-w-xl mx-auto min-h-[44px] flex flex-col items-center">
                <div className="flex items-center gap-2 text-indigo-200 mb-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span className="font-medium">AI-Enhanced Project</span>
                </div>
                <p className="text-white/80 text-sm">
                  {project.aiContribution.description}
                </p>
                <span className="text-teal-200 text-xs mt-1">Root-cause detection in seconds</span>
              </div>
            )}
          </div>
        </section>
      </EntranceReveal>
      {/* Main Content Sections */}
      <div className="pb-4">
        {/* Problem/Solution - alt navy */}
        <EntranceReveal>
          <section className="bg-[#13293d] py-16 md:py-24">
            <ProblemSolution project={{
              ...project,
              problem: project.problemSummary
                ? `${project.problem}\nFinance team spent 10 hrs/week manually reconciling anomalies.`
                : project.problem,
            }} />
          </section>
        </EntranceReveal>
        {/* Process Timeline - navy */}
        <EntranceReveal>
          <section className="bg-[#0a2236] py-16 md:py-24">
            <ProcessTimeline project={project} />
          </section>
        </EntranceReveal>
        {/* Results - gradient */}
        <EntranceReveal>
          <section className="bg-gradient-to-b from-[#0a2236] to-[#13293d] py-16 md:py-24">
            <ResultsHighlights project={project} />
          </section>
        </EntranceReveal>
        {/* Divider before Team */}
        <div className="w-full h-2 bg-gradient-to-r from-[#13293d] via-teal-700 to-[#0a2236] my-8 rounded-full" />
        {/* Team - navy */}
        <EntranceReveal>
          <section className="bg-[#0a2236] py-16 md:py-24">
            <TeamComposition project={project} />
          </section>
        </EntranceReveal>
        {/* Testimonial - teal gradient */}
        <EntranceReveal>
          <section className="bg-gradient-to-br from-teal-500 to-teal-600 py-16 md:py-24">
            <ClientTestimonial project={project} />
          </section>
        </EntranceReveal>
        {/* Navigation - sticky, navy */}
        <div className="sticky bottom-0 z-20 bg-gradient-to-t from-[#0a2236] via-[#0a2236]/90 to-[#0a2236]/0 pt-2">
          <NavPrevNext project={project} />
        </div>
      </div>
    </main>
  );
} 