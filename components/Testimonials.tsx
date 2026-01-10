"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

interface Testimonial {
  name: string;
  title: string;
  company: string;
  quote: string;
  avatar: string;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetch("/testimonials.json")
      .then((res) => res.json())
      .then(setTestimonials);
  }, []);

  return (
    <section id="testimonials" className="bg-gray-900 py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-10 text-white">What Our Clients Say</h2>
        <div className="grid gap-8 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <div key={i} className="flex flex-col md:flex-row items-center bg-gray-800 rounded-lg p-8 shadow border border-gray-700">
              <Image
                src={t.avatar}
                alt={t.name}
                width={64}
                height={64}
                className="rounded-full object-cover mb-4 md:mb-0 md:mr-6 border-2 border-teal-400"
              />
              <div className="flex-1 text-center md:text-left">
                <blockquote className="text-lg text-gray-100 italic mb-2">“{t.quote}”</blockquote>
                <div className="text-teal-400 font-semibold">{t.name}</div>
                <div className="text-gray-400 text-sm">{t.title}, {t.company}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 