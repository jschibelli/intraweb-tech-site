"use client";
import { useEffect, useState } from "react";

interface Testimonial {
  name: string;
  title: string;
  company: string;
  quote: string;
  avatar: string;
}

const bentoStyles: Record<number, string> = {
  0: "md:col-span-1 md:row-span-2",
  1: "md:col-span-1 md:row-span-1",
  2: "md:col-span-1 md:row-span-1",
  3: "md:col-span-2 md:row-span-1",
};

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetch("/testimonials.json")
      .then((res) => res.json())
      .then(setTestimonials);
  }, []);

  return (
    <section id="testimonials" className="relative bg-[#0a2236] py-16 md:py-24 overflow-hidden" style={{ backgroundImage: 'url(/hexagon-pattern.svg)', backgroundRepeat: 'repeat', backgroundSize: 'auto' }}>
      <div className="absolute top-0 left-0 w-full h-10 md:h-16 pointer-events-none select-none" style={{boxShadow: 'inset 0 16px 32px -8px #0008'}} />
      <div className="absolute bottom-0 left-0 w-full h-10 md:h-16 pointer-events-none select-none" style={{boxShadow: 'inset 0 -16px 32px -8px #0008'}} />
      <div className="relative z-10 max-w-5xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-10 text-white">What Our Clients Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-6 auto-rows-fr">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`flex flex-col justify-between bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-700/60 ${bentoStyles[i] || ""}`}
            >
              <blockquote className={`text-gray-100 italic mb-6 leading-relaxed ${i === 0 ? "text-xl" : "text-lg"}`}>
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-4">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-teal-400 flex-shrink-0"
                  loading="lazy"
                />
                <div>
                  <div className="text-teal-400 font-semibold">{t.name}</div>
                  <div className="text-gray-400 text-sm">{t.title}, {t.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
