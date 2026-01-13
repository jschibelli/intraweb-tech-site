"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="home-switching-station">
      {/* Section 1: Complexity Anchor (Entry Gravity) */}
      <section className="complexity-anchor">
        <div className="anchor-content">
          <h1 className="hero-primary">
            AI exists.
            <br />
            Most organizations still lack the structure to use it well.
          </h1>
          <p className="hero-sub">
            AI capability isn't the constraint. Priorities drift, implementation fragments,
            and accountability spreads across functions that don't converge. We work with
            firms that need institutional answers, not more pilots.
          </p>
        </div>
      </section>

      {/* Section 2: Identity Through Exclusion */}
      <section className="identity-section">
        <div className="identity-content">
          <p className="identity-text">
            We are not a consultancy that packages observations as strategy.
          </p>
          <p className="identity-text">
            We are not an agency that deploys tools without regard for durability.
          </p>
          <p className="identity-text">
            We are not a platform vendor optimizing for lock-in.
          </p>
          <p className="identity-text identity-spacer">
            We operate at the boundary between diagnosis and execution.
          </p>
        </div>
      </section>

      {/* Transition Landmark: Set-Apart Line */}
      <section className="set-apart-section">
        <div className="set-apart-content">
          <p className="set-apart-line">
            The question is not whether to use AI. The question is which problem you need to solve first.
          </p>
        </div>
      </section>

      {/* Decision Landmark: Visual Break Before Fork */}
      <div className="decision-landmark" />

      {/* Section 3: The Fork (Critical Element) */}
      <section className="fork-section">
        <div className="fork-container">
          <div className="fork-path">
            <h2 className="fork-header">AI Transformation</h2>
            <p className="fork-description">
              You require operational clarity before technical action.
              You need diagnostic frameworks, redesigned workflows,
              and institutional alignment across strategy, operations, and technology.
            </p>
            <p className="fork-description">
              This is not change management. This is structural redesign.
            </p>
            <Link href="/ai-transformation" className="fork-link">
              Explore AI Transformation
            </Link>
          </div>

          <div className="fork-path">
            <h2 className="fork-header">AI Engineering</h2>
            <p className="fork-description">
              You require execution without drift. You need system architecture,
              automation design, and integration discipline delivered by engineers
              who understand institutional constraints.
            </p>
            <p className="fork-description">
              This is not staff augmentation. This is technical leadership.
            </p>
            <Link href="/ai-engineering" className="fork-link">
              Explore AI Engineering
            </Link>
          </div>
        </div>
      </section>

      {/* Visual Rest: Horizontal Rule After Fork */}
      <div className="visual-rest" />

      {/* Section 4: Integrated Logic */}
      <section className="logic-section">
        <div className="logic-content">
          <p className="logic-text">
            These disciplines are separate because strategy without implementation creates entropy,
            and implementation without strategy creates technical debt. Most firms collapse both into
            a single undifferentiated offering. We do not. The work is distinct. The accountability is clear.
          </p>
        </div>
      </section>

      {/* Section 5: Threshold (Non-CTA) */}
      <section className="threshold-section">
        <div className="threshold-content">
          <Link href="/contact" className="threshold-link">
            Begin a conversation
          </Link>
        </div>
      </section>
    </main>
  );
}
