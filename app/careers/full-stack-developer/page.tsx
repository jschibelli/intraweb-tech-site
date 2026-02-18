import Link from 'next/link';

export const metadata = {
    title: "Full-Stack Developer | Careers at IntraWeb Technologies",
    description: "Build the Workant platform—our developer workflow automation tool. Next.js, React, TypeScript. $115K-$155K, Remote (US preferred).",
    openGraph: {
        title: "Full-Stack Developer - IntraWeb Technologies",
        description: "Join our team to build Workant, our developer workflow automation platform. Greenfield work with Next.js 14, React, TypeScript, and PostgreSQL.",
        type: "website",
        url: "https://intrawebtech.com/careers/full-stack-developer",
    },
};

export default function FullStackDeveloperPage() {
    return (
        <main>
            {/* Hero Section */}
            <section className="careers-hero careers-bg-primary">
                <div className="careers-hero-pattern" aria-hidden="true" />
                <div className="careers-container careers-hero-content">
                    <Link href="/careers" className="careers-back-link">
                        All Positions
                    </Link>
                    <h1 className="careers-page-title">Full-Stack Developer</h1>
                    <p className="careers-lead-text" style={{ marginBottom: '1.5rem' }}>
                        Workant Platform
                    </p>
                    <div className="careers-job-card-meta">
                        <span className="careers-badge careers-badge-type">Full-time</span>
                        <span className="careers-badge careers-badge-location">Remote (US preferred)</span>
                        <span className="careers-badge careers-badge-compensation">$115K-$155K</span>
                    </div>
                </div>
            </section>

            {/* What You'll Build */}
            <section className="careers-section careers-bg-alternate">
                <div className="careers-container">
                    <h2 className="careers-section-title">What You'll Build</h2>
                    <p className="careers-body-text">
                        Workant is our developer workflow automation platform—think "n8n meets GitHub Actions, but purpose-built
                        for AI-assisted development." You'll be building the core product that we use internally and plan to
                        commercialize. This is greenfield work with real users (us) from day one.
                    </p>

                    <h3 className="careers-subsection-title">Core Responsibilities</h3>
                    <ul className="careers-list">
                        <li>Build and refine Workant's core features: workflow orchestration, integration management, user dashboard</li>
                        <li>Implement UI/UX designs from our design system (we provide specs, you build them)</li>
                        <li>Develop API integrations for common developer tools (GitHub, Vercel, Linear, Slack)</li>
                        <li>Architect data models and backend services for multi-tenant SaaS</li>
                        <li>Optimize for performance—our users are developers who notice slow interfaces</li>
                    </ul>

                    <h3 className="careers-subsection-title">Current Stack</h3>
                    <div className="careers-tech-stack">
                        <span className="careers-tech-tag">Next.js 14</span>
                        <span className="careers-tech-tag">React</span>
                        <span className="careers-tech-tag">TypeScript</span>
                        <span className="careers-tech-tag">Tailwind CSS</span>
                        <span className="careers-tech-tag">Node.js</span>
                        <span className="careers-tech-tag">Prisma ORM</span>
                        <span className="careers-tech-tag">PostgreSQL</span>
                        <span className="careers-tech-tag">Vercel</span>
                    </div>
                </div>
            </section>

            {/* What We Need */}
            <section className="careers-section careers-bg-primary">
                <div className="careers-container">
                    <h2 className="careers-section-title">What We Need From You</h2>

                    <h3 className="careers-subsection-title">Required</h3>
                    <ul className="careers-list careers-list-required">
                        <li>4+ years production experience with React and Node.js</li>
                        <li>Strong TypeScript skills—we don't write any JavaScript</li>
                        <li>Experience building multi-tenant SaaS applications</li>
                        <li>Understanding of REST API design and database schema optimization</li>
                        <li>Comfortable owning features end-to-end (database → UI)</li>
                    </ul>

                    <h3 className="careers-subsection-title">Strongly Preferred</h3>
                    <ul className="careers-list careers-list-preferred">
                        <li>Next.js 14 experience (App Router, Server Components)</li>
                        <li>Prisma ORM familiarity</li>
                        <li>Understanding of developer tools and workflows</li>
                        <li>Experience with real-time features (webhooks, SSE, WebSockets)</li>
                        <li>Accessibility knowledge (WCAG AA compliance)</li>
                    </ul>

                    <h3 className="careers-subsection-title">Bonus Points</h3>
                    <ul className="careers-list careers-list-bonus">
                        <li>You've built workflow automation tools before</li>
                        <li>You use AI coding assistants regularly (Claude, Cursor, Copilot)</li>
                        <li>You have opinions on DX (developer experience) and can articulate them</li>
                    </ul>
                </div>
            </section>

            {/* Why This Role Exists */}
            <section className="careers-section careers-bg-alternate">
                <div className="careers-container">
                    <h2 className="careers-section-title">Why This Role Exists</h2>
                    <p className="careers-body-text">
                        Workant solves a problem we have—coordinating complex automation workflows across multiple tools and agents.
                        We're building it for ourselves first, which means:
                    </p>
                    <ul className="careers-list">
                        <li>Real user feedback daily (from our own team)</li>
                        <li>Clear product direction (we know what we need)</li>
                        <li>No guessing at requirements (if it works for us, it works)</li>
                    </ul>
                    <p className="careers-body-text">
                        You'll have significant input on architecture and features. This isn't "implement these tickets"—it's
                        "here's the problem we're solving, help us build the right solution."
                    </p>

                    <h3 className="careers-subsection-title">What Success Looks Like</h3>
                    <ul className="careers-success-list">
                        <li>Features ship with minimal bugs because you thought through edge cases</li>
                        <li>You proactively suggest improvements based on usage patterns</li>
                        <li>The UI you build matches our design system without constant revision</li>
                        <li>You can explain technical trade-offs to non-technical stakeholders</li>
                    </ul>
                </div>
            </section>

            {/* Our Development Approach */}
            <section className="careers-section careers-bg-primary">
                <div className="careers-container">
                    <h2 className="careers-section-title">Our Development Approach</h2>
                    <ul className="careers-philosophy-list">
                        <li><strong>Iteration over perfection:</strong> Ship, measure, refine</li>
                        <li><strong>Design system adherence:</strong> We provide clear UI specs, you implement faithfully</li>
                        <li><strong>User-first thinking:</strong> Every feature serves a real workflow</li>
                        <li><strong>Documentation matters:</strong> Code should be maintainable by future team members</li>
                        <li><strong>Performance is a feature:</strong> Fast interfaces aren't optional</li>
                    </ul>
                </div>
            </section>

            {/* Hiring Process */}
            <section className="careers-section careers-bg-alternate">
                <div className="careers-container">
                    <h2 className="careers-section-title">Our Hiring Process</h2>
                    <div className="careers-process-steps">
                        <div className="careers-process-step">
                            <div className="careers-process-number">1</div>
                            <div className="careers-process-content">
                                <div className="careers-process-title">Application Review (1 week)</div>
                                <div className="careers-process-description">
                                    Show us something you've built. GitHub repos, live products, or detailed case studies all work.
                                </div>
                            </div>
                        </div>
                        <div className="careers-process-step">
                            <div className="careers-process-number">2</div>
                            <div className="careers-process-content">
                                <div className="careers-process-title">Technical Assessment (~4 hours)</div>
                                <div className="careers-process-description">
                                    Build a small feature with our stack. We're evaluating code quality, not speed.
                                </div>
                            </div>
                        </div>
                        <div className="careers-process-step">
                            <div className="careers-process-number">3</div>
                            <div className="careers-process-content">
                                <div className="careers-process-title">Code Review Discussion (60 min video)</div>
                                <div className="careers-process-description">
                                    Walk through your assessment. We'll discuss architecture choices and alternative approaches.
                                </div>
                            </div>
                        </div>
                        <div className="careers-process-step">
                            <div className="careers-process-number">4</div>
                            <div className="careers-process-content">
                                <div className="careers-process-title">Product & Vision Alignment (45 min video)</div>
                                <div className="careers-process-description">
                                    Meet John (CEO) and discuss Workant's roadmap, your role in it, and how you work best.
                                </div>
                            </div>
                        </div>
                        <div className="careers-process-step">
                            <div className="careers-process-number">5</div>
                            <div className="careers-process-content">
                                <div className="careers-process-title">Offer or Clear Feedback</div>
                                <div className="careers-process-description">
                                    Within 3 days of final interview.
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="careers-hr" />

                    <div className="careers-apply-box">
                        <h3 className="careers-subsection-title">Ready to Apply?</h3>
                        <p className="careers-body-text">
                            Email <a href="mailto:careers@intrawebtech.com" className="careers-apply-email">careers@intrawebtech.com</a> with
                            your resume, links to your work (GitHub, live projects, case studies), and why this role interests you.
                        </p>
                        <Link href="/careers" className="careers-btn-secondary">
                            View All Positions
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
