"use client";

import { useEffect, useState, useRef, useCallback, type ReactNode } from "react";
import EntranceReveal from "@/components/ui/EntranceReveal";

interface ContactBlockProps {
  heading: string;
  text: string;
  email: string;
  variant?: "default" | "warm";
}

export function ContactBlock({
  heading,
  text,
  email,
  variant = "default",
}: ContactBlockProps) {
  return (
    <div
      className={`mt-12 rounded-lg p-6 ${
        variant === "warm"
          ? "bg-teal-500/10 border border-teal-500/20"
          : "bg-gray-800 border border-gray-700"
      }`}
    >
      <h3 className="text-lg font-semibold text-white">{heading}</h3>
      <p className="text-gray-300 mt-2">
        {text}{" "}
        <a
          href={`mailto:${email}`}
          className="text-teal-400 hover:text-orange-500 transition-colors"
        >
          {email}
        </a>
      </p>
    </div>
  );
}

function TableOfContents({
  headings,
  activeId,
}: {
  headings: { id: string; text: string }[];
  activeId: string;
}) {
  if (headings.length < 5) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="hidden xl:block sticky top-32 self-start w-56 shrink-0"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
        On this page
      </p>
      <ul className="space-y-2 border-l border-gray-700 pl-4">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`text-sm block transition-colors duration-150 ${
                activeId === h.id
                  ? "text-teal-400 font-medium"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

interface LegalPageLayoutProps {
  title: string;
  eyebrow?: string;
  lastUpdated: string;
  children: ReactNode;
  showToc?: boolean;
}

export function LegalPageLayout({
  title,
  eyebrow,
  lastUpdated,
  children,
  showToc = false,
}: LegalPageLayoutProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (!showToc || !contentRef.current) return;

    const h2s = contentRef.current.querySelectorAll("h2");
    const items: { id: string; text: string }[] = [];

    h2s.forEach((el) => {
      if (!el.id) {
        el.id = (el.textContent || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }
      items.push({ id: el.id, text: el.textContent || "" });
    });

    setHeadings(items);
  }, [showToc]);

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    const visible = entries.filter((e) => e.isIntersecting);
    if (visible.length > 0) {
      setActiveId(visible[0].target.id);
    }
  }, []);

  useEffect(() => {
    if (!showToc || headings.length < 5 || !contentRef.current) return;

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "-96px 0px -60% 0px",
      threshold: 0,
    });

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [showToc, headings, handleIntersect]);

  const showSidebar = showToc && headings.length >= 5;

  return (
    <div className="pt-24 pb-16 bg-gray-900 text-white min-h-screen">
      <div
        className={`mx-auto px-4 md:px-8 ${
          showSidebar ? "max-w-[1024px] flex gap-12 items-start" : "max-w-[720px]"
        }`}
      >
        {showSidebar && <TableOfContents headings={headings} activeId={activeId} />}

        <div className="min-w-0 flex-1">
          <EntranceReveal>
            <div className="max-w-[720px]">
              {eyebrow && (
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-teal-400 mb-3">
                  {eyebrow}
                </p>
              )}
              <h1 className="text-3xl font-semibold text-white">{title}</h1>
              <p className="text-sm text-gray-400 mt-2">Last updated: {lastUpdated}</p>
              <hr className="border-t border-gray-700 mt-8 mb-12" />
            </div>
          </EntranceReveal>

          <EntranceReveal>
            <div ref={contentRef} className="legal-prose-dark max-w-[720px]">
              {children}
            </div>
          </EntranceReveal>
        </div>
      </div>
    </div>
  );
}
