"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Code, Palette, Cloud, Sparkles } from "lucide-react";


const iconMap = {
  Code,
  Palette,
  Cloud,
  Sparkles,
};

interface Service {
  title: string;
  description: string;
  icon: keyof typeof iconMap;
  features: string[];
  caseStudies: {
    title: string;
    description: string;
    image: string;
    link: string;
  }[];
}

interface ServicesData {
  hero: {
    heading: string;
    subheading: string;
    description: string;
  };
  services: Service[];
  cta: {
    heading: string;
    description: string;
    button: {
      label: string;
      href: string;
    };
  };
}

export default function ServicesPage() {
  const [data, setData] = useState<ServicesData | null>(null);

  useEffect(() => {
    fetch("/services-detailed.json")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return null;

  return (
    <main className="bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden" style={{ backgroundImage: 'url(/circuit-pattern.svg)', backgroundRepeat: 'repeat', backgroundSize: 'auto' }}>
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500 opacity-20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-500 opacity-20 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4">{data.hero.heading}</h1>
          <p className="text-xl md:text-2xl text-teal-400 font-semibold mb-4">{data.hero.subheading}</p>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">{data.hero.description}</p>
        </div>
      </section>

      {/* Services Sections */}
      {data.services.map((service, index) => {
        const Icon = iconMap[service.icon];
        // Map service case study title to project slug
        let caseStudySlug = "#";
        if (service.caseStudies[0]) {
          const title = service.caseStudies[0].title.toLowerCase();
          if (title.includes("e-commerce")) caseStudySlug = "ecommerce-platform";
          else if (title.includes("saas")) caseStudySlug = "healthcare-app";
          else if (title.includes("cloud")) caseStudySlug = "fintech-dashboard";
          else if (title.includes("ai")) caseStudySlug = "fintech-dashboard";
        }
        return (
          <section key={service.title} className={`py-16 md:py-24 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}`}>
            <div className="max-w-5xl mx-auto px-4">
              <div className="flex flex-col md:flex-row gap-12 items-start">
                {/* Service Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <span className="p-3 rounded-lg bg-teal-500/10 text-teal-400">
                      <Icon size={32} />
                    </span>
                    <h2 className="text-3xl font-heading font-bold">{service.title}</h2>
                  </div>
                  <p className="text-lg text-gray-300 mb-8">{service.description}</p>
                  <ul className="space-y-3">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-teal-400" />
                        <span className="text-gray-200">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Case Study */}
                {service.caseStudies[0] && (
                  <div className="flex-1">
                    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg relative h-48">
                      <Image
                        src={service.caseStudies[0].image}
                        alt={service.caseStudies[0].title}
                        fill
                        className="object-cover"
                      />
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{service.caseStudies[0].title}</h3>
                        <p className="text-gray-300 mb-4">{service.caseStudies[0].description}</p>
                        <Link
                          href={caseStudySlug !== "#" ? `/portfolio/${caseStudySlug}` : "#"}
                          className="inline-block px-4 py-2 rounded bg-teal-500 text-white font-semibold hover:bg-teal-600 transition-colors"
                        >
                          View Case Study
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gray-800">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">{data.cta.heading}</h2>
          <p className="text-lg text-gray-300 mb-8">{data.cta.description}</p>
          <Link
            href={data.cta.button.href}
            className="inline-block px-8 py-3 rounded bg-orange-500 text-white font-semibold text-lg hover:bg-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            {data.cta.button.label}
          </Link>
        </div>
      </section>
    </main>
  );
} 