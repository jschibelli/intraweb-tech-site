import React from "react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a2236]">
      <div className="mx-auto max-w-[800px] px-6 pt-12 pb-16 md:pt-16 md:pb-20 text-[17px] md:text-[18px] leading-[1.75] text-[#e0e0e0] font-sans">
        <h1 className="text-3xl md:text-4xl font-medium text-white font-heading mb-10 md:mb-12">
          About IntraWeb Technologies
        </h1>

        {/* Section 1: Institutional Position */}
        <section className="space-y-4 mb-10 md:mb-12">
          <p>
            IntraWeb Technologies is a technology firm organized around two distinct operational tracks: AI Transformation and AI Engineering.
          </p>
          <p>
            This structure exists because organizational AI problems and technical AI problems require different decision-making frameworks, different engagement models, and different expertise.
          </p>
          <p>
            We do not blend these tracks. Organizations either need transformation work or they need engineering work. This structure exists to prevent misalignment at the outset of engagement.
          </p>
          <p>This is not a service menu. It is an operational filter.</p>
        </section>

        <div className="border-t border-[#13293d] mb-10 md:mb-12" />

        {/* Section 2: Structural Logic */}
        <section className="space-y-6 mb-10 md:mb-12">
          <h2 className="text-xl md:text-2xl font-medium text-white font-heading">Structural Logic</h2>

          <div className="space-y-4">
            <p className="font-medium text-white">Why the fork exists:</p>
            <p>
              Most firms treat AI as a capability layer that can be applied uniformly across strategy and implementation. This creates misalignment.
            </p>

            <div className="space-y-4">
              <p>AI Transformation work addresses:</p>
              <ul className="list-disc pl-5 space-y-2 marker:text-[#14b8a6]">
                <li>Decision-making frameworks for AI adoption</li>
                <li>Organizational readiness and process redesign</li>
                <li>Risk modeling and governance structure</li>
              </ul>
            </div>

            <div className="space-y-4">
              <p>AI Engineering work addresses:</p>
              <ul className="list-disc pl-5 space-y-2 marker:text-[#14b8a6]">
                <li>System architecture for AI integration</li>
                <li>Implementation of production AI systems</li>
                <li>Performance optimization and scaling</li>
              </ul>
            </div>

            <p>
              These are not sequential phases of the same engagement. They are structurally different problems.
            </p>
            <p>
              Organizations that attempt to solve transformation problems with engineering resources fail. Organizations that attempt to solve engineering problems with transformation consulting fail.
            </p>
            <p>The fork prevents both failure modes.</p>
          </div>

          <div className="space-y-6 pt-6">
            <p className="font-medium text-white">How they relate:</p>
            <p>
              Transformation engagements may identify engineering requirements. Engineering engagements may surface transformation gaps. When this occurs, we refer to the appropriate track or disengage.
            </p>
            <p>We do not expand scope to capture both. The structural separation is the point.</p>
          </div>
        </section>

        <div className="border-t border-[#13293d] mb-10 md:mb-12" />

        {/* Section 3: Belief System */}
        <section className="space-y-6 mb-10 md:mb-12">
          <h2 className="text-xl md:text-2xl font-medium text-white font-heading">Belief System</h2>

          <div className="space-y-6">
            <p className="font-medium text-white">What most firms misunderstand about AI work:</p>
            <p>AI is not a feature set. It is not a technology stack. It is not a consulting practice area.</p>
            <p>AI work is systems work. It requires operational discipline, technical precision, and institutional patience.</p>

            <p>The firms that fail do so because they:</p>
            <ul className="list-disc pl-5 space-y-2 marker:text-[#14b8a6]">
              <li>Treat AI adoption as a technology decision rather than an organizational design problem</li>
              <li>Assume engineering capability implies transformation readiness</li>
              <li>Conflate proof-of-concept success with production viability</li>
              <li>Underestimate the compliance, governance, and ethical frameworks required for institutional AI</li>
            </ul>
          </div>

          <div className="space-y-6 pt-6">
            <p className="font-medium text-white">What we consider non-negotiable:</p>
            <ul className="list-disc pl-5 space-y-2 marker:text-[#14b8a6]">
              <li>AI systems must be auditable</li>
              <li>AI work must include failure mode analysis</li>
              <li>AI implementations must respect regulatory boundaries</li>
              <li>AI transformation must account for organizational resistance</li>
            </ul>

            <p className="pt-2">
              We do not pitch AI as efficiency magic. We do not promise transformation without redesign. We do not build systems that cannot be maintained.
            </p>
          </div>
        </section>

        <div className="border-t border-[#13293d] mb-16 md:mb-24" />

        {/* Section 4: Engagement Boundary */}
        <section className="space-y-6 mb-10 md:mb-12">
          <h2 className="text-xl md:text-2xl font-medium text-white font-heading">Engagement Boundary</h2>

          <div className="space-y-6">
            <p className="font-medium text-white">This firm is not for:</p>

            <p>
              Organizations seeking vendor execution of predefined requirements. We do not operate as an implementation service for decisions made elsewhere.
            </p>
            <p>
              Organizations expecting AI adoption without operational change.
            </p>
            <p>
              Transformation requires redesign. Engineering requires institutional commitment to maintenance and evolution.
            </p>
            <p>
              Organizations treating AI work as a cost-reduction initiative with fixed timelines.
            </p>
            <p>
              AI systems require iterative development, failure analysis, and governance overhead that cannot be compressed.
            </p>
          </div>

          <div className="space-y-6 pt-6">
            <p className="font-medium text-white">Mismatch signals we decline:</p>

            <ul className="space-y-2">
              <li className="flex gap-3"><span className="text-[#6b7280]">-</span><span>Requests for capability demonstrations before problem definition</span></li>
              <li className="flex gap-3"><span className="text-[#6b7280]">-</span><span>Expectation that AI will eliminate existing process friction without process redesign</span></li>
              <li className="flex gap-3"><span className="text-[#6b7280]">-</span><span>Unwillingness to assign internal decision-making authority to the engagement</span></li>
              <li className="flex gap-3"><span className="text-[#6b7280]">-</span><span>Treating compliance and governance as post-deployment considerations</span></li>
            </ul>

            <p className="pt-2">
              Organizations that bifurcate responsibility, assigning strategy internally while outsourcing implementation, create unresolvable gaps. We do not accept engagements structured this way.
            </p>
            <p>
              Organizations that expect AI systems to operate autonomously without human oversight frameworks are building liability, not capability. We do not build systems designed to avoid accountability.
            </p>
            <p>
              We disengage when misalignment becomes structural. This is not a negotiation position. It is operational necessity.
            </p>
          </div>
        </section>

        <div className="border-t border-[#13293d] mb-10 md:mb-12" />

        {/* Section 5: Working Relationship */}
        <section className="space-y-6">
          <h2 className="text-xl md:text-2xl font-medium text-white font-heading">Working Relationship</h2>

          <div className="space-y-6">
            <p className="font-medium text-white">Pace:</p>
            <p>
              AI work does not compress.
            </p>
            <p>
              Transformation engagements operate on institutional timelines (months, not weeks). Engineering engagements operate on technical timelines (defined by architecture complexity, integration surface area, and testing requirements).
            </p>
            <p>
              We do not accelerate timelines to meet arbitrary deadlines. We do not deliver partial systems to satisfy milestone pressure.
            </p>
          </div>

          <div className="space-y-6 pt-6">
            <p className="font-medium text-white">Responsibility distribution:</p>
            <p>
              Clients retain decision-making authority. We provide analysis, architecture, and implementation, but we do not make organizational decisions on behalf of clients.
            </p>
            <p>
              AI Transformation engagements require executive sponsorship and cross-functional participation. If decision-makers are unavailable, the engagement stalls.
            </p>
            <p>
              AI Engineering engagements require technical counterparts with institutional knowledge. If internal teams cannot participate in architecture review, integration fails.
            </p>
          </div>

          <div className="space-y-6 pt-6">
            <p className="font-medium text-white">What clients are expected to bring:</p>
            <ul className="list-disc pl-5 space-y-2 marker:text-[#14b8a6]">
              <li>Internal access to decision-making structures</li>
              <li>Willingness to surface institutional resistance early</li>
              <li>Technical or operational counterparts who can validate assumptions</li>
              <li>Acceptance that AI work surfaces problems, not just solutions</li>
            </ul>
          </div>

          <div className="space-y-6 pt-6">
            <p className="font-medium text-white">What collaboration actually feels like:</p>
            <p>
              We do not operate as external consultants delivering recommendations for internal teams to execute. We operate as integrated capacity (making decisions alongside client teams, validating assumptions in real time, and adjusting scope as institutional realities emerge). This does not transfer accountability. Clients remain responsible for institutional decisions and outcomes.
            </p>
            <p>
              This requires transparency. Clients who withhold operational context to maintain negotiating leverage create failure conditions.
            </p>
            <p>
              We do not manage stakeholder politics. We do not reframe difficult findings to ease internal communication. We do not optimize for client comfort.
            </p>
            <p>We optimize for alignment, institutional clarity, and sustainable system design.</p>
          </div>
        </section>
      </div>
    </div>
  );
}