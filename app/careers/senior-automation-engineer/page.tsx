import Link from 'next/link';

export const metadata = {
    title: "Senior Automation Engineer | Careers at IntraWeb Technologies",
    description: "Design and deploy workflow automation that eliminates coordination drag for SMB clients. $110K-$145K, Remote (US preferred).",
    openGraph: {
        title: "Senior Automation Engineer - IntraWeb Technologies",
        description: "Join our team as a Senior Automation Engineer. Build n8n workflows, develop MCP integrations, and deliver measurable time savings for clients.",
        type: "website",
        url: "https://intrawebtech.com/careers/senior-automation-engineer",
    },
};

export default function SeniorAutomationEngineerPage() {
    return (
        <main>
            {/* Hero Section */}
            <section className="careers-hero careers-bg-primary">
                <div className="careers-hero-pattern" aria-hidden="true" />
                <div className="careers-container careers-hero-content">
                    <Link href="/careers" className="careers-back-link">
                        All Positions
                    </Link>
                    <h1 className="careers-page-title">Senior Automation Engineer</h1>
                    <p className="careers-lead-text" style={{ marginBottom: '1.5rem' }}>
                        Operations Focus
                    </p>
                    <div className="careers-job-card-meta">
                        <span className="careers-badge careers-badge-type">Full-time</span>
                        <span className="careers-badge careers-badge-location">Remote (US preferred)</span>
                        <span className="careers-badge careers-badge-compensation">$110K-$145K</span>
                    </div>
                </div>
            </section>

            {/* What You'll Do */}
            <section className="careers-section careers-bg-alternate">
                <div className="careers-container">
                    <h2 className="careers-section-title">What You'll Do</h2>
                    <p className="careers-body-text">
                        You'll design and deploy workflow automation that eliminates coordination drag for our SMB clients.
                        This isn't traditional software development—you're an operational architect who happens to use code.
                        Your work directly translates to 10-20 hours recovered per week for each client.
                    </p>

                    <h3 className="careers-subsection-title">Core Responsibilities</h3>
                    <ul className="careers-list">
                        <li>Build n8n workflows that connect disparate business tools into coherent automation systems</li>
                        <li>Develop custom MCP server integrations for client-specific requirements</li>
                        <li>Map client processes to identify high-impact automation opportunities</li>
                        <li>Deploy and maintain automation infrastructure for multiple concurrent clients</li>
                        <li>Create documentation that enables clients to understand and trust their automated systems</li>
                    </ul>

                    <h3 className="careers-subsection-title">Day-to-Day Reality</h3>
                    <div className="careers-reality-grid">
                        <div className="careers-reality-item">
                            <div className="careers-reality-percent">60%</div>
                            <div className="careers-reality-label">Implementation: Building workflows, testing, debugging</div>
                        </div>
                        <div className="careers-reality-item">
                            <div className="careers-reality-percent">25%</div>
                            <div className="careers-reality-label">Client collaboration: Process mapping, training</div>
                        </div>
                        <div className="careers-reality-item">
                            <div className="careers-reality-percent">15%</div>
                            <div className="careers-reality-label">Architecture: Designing patterns, evaluating tools</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* What We Need */}
            <section className="careers-section careers-bg-primary">
                <div className="careers-container">
                    <h2 className="careers-section-title">What We Need From You</h2>

                    <h3 className="careers-subsection-title">Required</h3>
                    <ul className="careers-list careers-list-required">
                        <li>3+ years building production automation (n8n, Zapier, Make, or similar platforms)</li>
                        <li>Strong API integration experience—you understand OAuth, webhooks, and rate limits</li>
                        <li>Comfortable in Node.js/TypeScript for custom logic and MCP server development</li>
                        <li>Process thinking—you see systems, not just individual tasks</li>
                        <li>Client-facing skills—you can explain technical decisions to non-technical operators</li>
                    </ul>

                    <h3 className="careers-subsection-title">Strongly Preferred</h3>
                    <ul className="careers-list careers-list-preferred">
                        <li>Experience with Google Workspace, Slack, Asana, or other common SMB tools</li>
                        <li>Background in operations, not just pure engineering</li>
                        <li>Familiarity with Anthropic's Model Context Protocol (MCP)</li>
                        <li>Understanding of business process optimization frameworks</li>
                    </ul>

                    <h3 className="careers-subsection-title">Not Required (We'll Teach You)</h3>
                    <ul className="careers-list careers-list-bonus">
                        <li>Deep AI/ML knowledge—we use AI as a tool, not a research area</li>
                        <li>Enterprise-scale experience—our clients are 10-150 people</li>
                        <li>Traditional software architecture—this isn't microservices</li>
                    </ul>
                </div>
            </section>

            {/* Why This Role Exists */}
            <section className="careers-section careers-bg-alternate">
                <div className="careers-container">
                    <h2 className="careers-section-title">Why This Role Exists</h2>
                    <p className="careers-body-text">
                        Our clients don't need more software—they need less chaos. You're the person who figures out why a
                        30-person company has 14 tools that don't talk to each other, then fixes it. You'll work embedded
                        with client teams for 4-8 weeks, ship automation that sticks, then move to the next engagement
                        while maintaining what you built.
                    </p>

                    <h3 className="careers-subsection-title">What Success Looks Like</h3>
                    <ul className="careers-success-list">
                        <li>Client contacts you directly when they need something automated</li>
                        <li>Your workflows run for months without intervention</li>
                        <li>You identify automation opportunities clients didn't know existed</li>
                        <li>You deliver measurable time savings within 4 weeks of engagement start</li>
                    </ul>
                </div>
            </section>

            {/* Hiring Process */}
            <section className="careers-section careers-bg-primary">
                <div className="careers-container">
                    <h2 className="careers-section-title">Our Hiring Process</h2>
                    <div className="careers-process-steps">
                        <div className="careers-process-step">
                            <div className="careers-process-number">1</div>
                            <div className="careers-process-content">
                                <div className="careers-process-title">Application Review (1 week)</div>
                                <div className="careers-process-description">
                                    We read every application. Include a brief note about a workflow you automated and the impact it had.
                                </div>
                            </div>
                        </div>
                        <div className="careers-process-step">
                            <div className="careers-process-number">2</div>
                            <div className="careers-process-content">
                                <div className="careers-process-title">Technical Assessment (~3 hours)</div>
                                <div className="careers-process-description">
                                    Design an automation solution for a realistic SMB scenario. We're evaluating problem decomposition, not coding speed.
                                </div>
                            </div>
                        </div>
                        <div className="careers-process-step">
                            <div className="careers-process-number">3</div>
                            <div className="careers-process-content">
                                <div className="careers-process-title">Architecture Discussion (60 min video)</div>
                                <div className="careers-process-description">
                                    Walk us through your assessment. We'll explore edge cases and alternative approaches.
                                </div>
                            </div>
                        </div>
                        <div className="careers-process-step">
                            <div className="careers-process-number">4</div>
                            <div className="careers-process-content">
                                <div className="careers-process-title">Culture & Vision Alignment (45 min video)</div>
                                <div className="careers-process-description">
                                    Meet John (CEO) and discuss how you work, what you need from a team, and where you want to grow.
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
                            your resume, a brief note on why this role interests you, and an example of automation work you've done.
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
