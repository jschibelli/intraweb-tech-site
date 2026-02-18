import Link from 'next/link';

export const metadata = {
    title: "Operations Analyst | Careers at IntraWeb Technologies",
    description: "Bridge our automation capabilities with client needs. Map processes, identify bottlenecks, and deliver measurable results. $85K-$115K, Remote (US preferred).",
    openGraph: {
        title: "Operations Analyst - IntraWeb Technologies",
        description: "Join our team as an Operations Analyst. Lead client diagnostics, conduct process mapping, and identify high-impact automation opportunities.",
        type: "website",
        url: "https://intrawebtech.com/careers/operations-analyst",
    },
};

export default function OperationsAnalystPage() {
    return (
        <main>
            {/* Hero Section */}
            <section className="careers-hero careers-bg-primary">
                <div className="careers-hero-pattern" aria-hidden="true" />
                <div className="careers-container careers-hero-content">
                    <Link href="/careers" className="careers-back-link">
                        All Positions
                    </Link>
                    <h1 className="careers-page-title">Operations Analyst</h1>
                    <p className="careers-lead-text" style={{ marginBottom: '1.5rem' }}>
                        Client Delivery
                    </p>
                    <div className="careers-job-card-meta">
                        <span className="careers-badge careers-badge-type">Full-time</span>
                        <span className="careers-badge careers-badge-location">Remote (US preferred)</span>
                        <span className="careers-badge careers-badge-compensation">$85K-$115K</span>
                    </div>
                </div>
            </section>

            {/* What You'll Do */}
            <section className="careers-section careers-bg-alternate">
                <div className="careers-container">
                    <h2 className="careers-section-title">What You'll Do</h2>
                    <p className="careers-body-text">
                        You're the bridge between our automation capabilities and client needs. You'll map processes, identify
                        bottlenecks, quantify impact, and ensure our engagements deliver measurable results. This role combines
                        business analysis, project management, and operational consulting.
                    </p>

                    <h3 className="careers-subsection-title">Core Responsibilities</h3>
                    <ul className="careers-list">
                        <li>Lead diagnostic phase for new client engagements (2-3 weeks per client)</li>
                        <li>Conduct process mapping sessions to document current-state workflows</li>
                        <li>Identify high-impact automation opportunities and estimate time savings</li>
                        <li>Track metrics: recovered time, ROI, engagement success indicators</li>
                        <li>Manage client onboarding and coordinate implementation with engineering team</li>
                        <li>Create client-facing documentation and training materials</li>
                    </ul>

                    <h3 className="careers-subsection-title">Day-to-Day Reality</h3>
                    <div className="careers-reality-grid">
                        <div className="careers-reality-item">
                            <div className="careers-reality-percent">40%</div>
                            <div className="careers-reality-label">Client interaction: Interviews, process mapping, updates</div>
                        </div>
                        <div className="careers-reality-item">
                            <div className="careers-reality-percent">30%</div>
                            <div className="careers-reality-label">Analysis: Identifying patterns, quantifying impact</div>
                        </div>
                        <div className="careers-reality-item">
                            <div className="careers-reality-percent">20%</div>
                            <div className="careers-reality-label">Documentation: Process maps, ROI reports, guides</div>
                        </div>
                    </div>
                    <p className="careers-body-text" style={{ marginTop: '1rem', fontSize: '0.9375rem', color: '#d0d0d0' }}>
                        Plus 10% internal coordination with engineering and methodology refinement.
                    </p>
                </div>
            </section>

            {/* What We Need */}
            <section className="careers-section careers-bg-primary">
                <div className="careers-container">
                    <h2 className="careers-section-title">What We Need From You</h2>

                    <h3 className="careers-subsection-title">Required</h3>
                    <ul className="careers-list careers-list-required">
                        <li>3+ years in operations, business analysis, or management consulting</li>
                        <li>Strong process thinking—you see systems, not just tasks</li>
                        <li>Excel/Google Sheets proficiency for data analysis and reporting</li>
                        <li>Excellent written and verbal communication—you'll present to executives</li>
                        <li>Project management skills—juggling multiple client engagements simultaneously</li>
                    </ul>

                    <h3 className="careers-subsection-title">Strongly Preferred</h3>
                    <ul className="careers-list careers-list-preferred">
                        <li>Experience with process optimization frameworks (Lean, Six Sigma, etc.)</li>
                        <li>Familiarity with common SMB tools (Asana, Slack, Google Workspace, HubSpot)</li>
                        <li>Understanding of automation concepts (even if you don't code)</li>
                        <li>Background working with 10-150 person companies</li>
                    </ul>

                    <h3 className="careers-subsection-title">Not Required</h3>
                    <ul className="careers-list careers-list-bonus">
                        <li>Technical background—we'll teach you enough to be dangerous</li>
                        <li>Industry-specific expertise—our clients span multiple verticals</li>
                        <li>Previous automation experience—curiosity and systems thinking matter more</li>
                    </ul>
                </div>
            </section>

            {/* Why This Role Exists */}
            <section className="careers-section careers-bg-alternate">
                <div className="careers-container">
                    <h2 className="careers-section-title">Why This Role Exists</h2>
                    <p className="careers-body-text">
                        Automation only works if you automate the right things. You're the person who figures out what those things are.
                        You'll spend time with clients understanding how they actually work (not how they think they work), then translate
                        that into automation requirements our engineers can implement.
                    </p>

                    <h3 className="careers-subsection-title">What Success Looks Like</h3>
                    <ul className="careers-success-list">
                        <li>Clients trust you enough to show you their messy reality</li>
                        <li>You identify 10-20 hours/week in recoverable time within the diagnostic phase</li>
                        <li>Your process maps accurately reflect client workflows</li>
                        <li>Engineering team has clear, actionable requirements from your analysis</li>
                        <li>Clients renew into ongoing partnerships because they see continuous value</li>
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
                                    Tell us about a process you optimized and the impact it had. Numbers matter.
                                </div>
                            </div>
                        </div>
                        <div className="careers-process-step">
                            <div className="careers-process-number">2</div>
                            <div className="careers-process-content">
                                <div className="careers-process-title">Case Study Assessment (~2 hours)</div>
                                <div className="careers-process-description">
                                    Analyze a fictional client's workflows and recommend automation opportunities.
                                </div>
                            </div>
                        </div>
                        <div className="careers-process-step">
                            <div className="careers-process-number">3</div>
                            <div className="careers-process-content">
                                <div className="careers-process-title">Analysis Discussion (60 min video)</div>
                                <div className="careers-process-description">
                                    Present your case study findings and defend your recommendations.
                                </div>
                            </div>
                        </div>
                        <div className="careers-process-step">
                            <div className="careers-process-number">4</div>
                            <div className="careers-process-content">
                                <div className="careers-process-title">Culture & Vision Alignment (45 min video)</div>
                                <div className="careers-process-description">
                                    Meet John (CEO) and discuss how you work with clients, handle ambiguity, and prioritize competing demands.
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
                            your resume, and tell us about a process you optimized—include the numbers.
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
