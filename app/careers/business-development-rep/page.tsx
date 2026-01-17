import Link from 'next/link';

export const metadata = {
    title: "Business Development Representative | Careers at IntraWeb Technologies",
    description: "Identify and qualify prospects drowning in coordination overhead. $70K + $35K-$50K commission, Remote (US preferred).",
    openGraph: {
        title: "Business Development Representative - IntraWeb Technologies",
        description: "Join our team as a BDR. Research-driven outbound to identify SMBs with operational challenges. $70K base + commission, OTE $105K-$120K.",
        type: "website",
        url: "https://intrawebtech.com/careers/business-development-rep",
    },
};

export default function BusinessDevelopmentRepPage() {
    return (
        <main>
            {/* Hero Section */}
            <section className="careers-hero careers-bg-primary">
                <div className="careers-hero-pattern" aria-hidden="true" />
                <div className="careers-container careers-hero-content">
                    <Link href="/careers" className="careers-back-link">
                        All Positions
                    </Link>
                    <h1 className="careers-page-title">Business Development Representative</h1>
                    <p className="careers-lead-text" style={{ marginBottom: '1.5rem' }}>
                        Outbound Focus
                    </p>
                    <div className="careers-job-card-meta">
                        <span className="careers-badge careers-badge-type">Full-time</span>
                        <span className="careers-badge careers-badge-location">Remote (US preferred)</span>
                        <span className="careers-badge careers-badge-compensation">$70K + $35K-$50K commission</span>
                    </div>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.9375rem', color: '#14b8a6' }}>
                        OTE: $105K-$120K
                    </p>
                </div>
            </section>

            {/* What You'll Do */}
            <section className="careers-section careers-bg-alternate">
                <div className="careers-container">
                    <h2 className="careers-section-title">What You'll Do</h2>
                    <p className="careers-body-text">
                        Identify and qualify prospects who fit our ideal client profile: 10-150 person companies drowning in coordination overhead.
                        You'll run outbound campaigns, book discovery calls, and qualify opportunities for our CEO to close. This isn't cold calling
                        at scale—it's targeted, research-driven outreach.
                    </p>

                    <h3 className="careers-subsection-title">Core Responsibilities</h3>
                    <ul className="careers-list">
                        <li>Build targeted prospect lists using LinkedIn, ZoomInfo, and industry research</li>
                        <li>Craft personalized outreach sequences (email + LinkedIn)</li>
                        <li>Conduct initial discovery calls to qualify fit</li>
                        <li>Book qualified meetings for CEO (John)</li>
                        <li>Maintain CRM hygiene and pipeline visibility in HubSpot</li>
                        <li>Collaborate with marketing on messaging and positioning refinement</li>
                    </ul>

                    <h3 className="careers-subsection-title">Day-to-Day Reality</h3>
                    <div className="careers-reality-grid">
                        <div className="careers-reality-item">
                            <div className="careers-reality-percent">50%</div>
                            <div className="careers-reality-label">Outreach: Research, personalized messages, follow-up</div>
                        </div>
                        <div className="careers-reality-item">
                            <div className="careers-reality-percent">30%</div>
                            <div className="careers-reality-label">Qualification: Discovery calls, assessing fit</div>
                        </div>
                        <div className="careers-reality-item">
                            <div className="careers-reality-percent">20%</div>
                            <div className="careers-reality-label">Coordination: CRM management, meeting scheduling</div>
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
                        <li>2+ years in B2B sales development or similar outbound role</li>
                        <li>Strong written communication—your emails need to stand out</li>
                        <li>Comfortable on the phone conducting discovery conversations</li>
                        <li>CRM proficiency (HubSpot preferred)</li>
                        <li>Self-directed work ethic—you manage your own pipeline</li>
                    </ul>

                    <h3 className="careers-subsection-title">Strongly Preferred</h3>
                    <ul className="careers-list careers-list-preferred">
                        <li>Experience selling to operations leaders or executives</li>
                        <li>Understanding of SMB buying behavior and decision-making</li>
                        <li>Familiarity with services or consulting sales (not just SaaS)</li>
                        <li>Background in a high-outreach environment (50+ prospects/week)</li>
                    </ul>

                    <h3 className="careers-subsection-title">Not Required</h3>
                    <ul className="careers-list careers-list-bonus">
                        <li>Technical background—we'll teach you enough about automation</li>
                        <li>Previous startup experience—coachability matters more than pedigree</li>
                    </ul>
                </div>
            </section>

            {/* Why This Role Exists */}
            <section className="careers-section careers-bg-alternate">
                <div className="careers-container">
                    <h2 className="careers-section-title">Why This Role Exists</h2>
                    <p className="careers-body-text">
                        We have a proven service model and clear value proposition. What we need is qualified pipeline. You're responsible for finding
                        companies with operational drag, determining if we can help, and getting us in the room. If you do that well, closing is straightforward.
                    </p>

                    <h3 className="careers-subsection-title">What Success Looks Like</h3>
                    <ul className="careers-success-list">
                        <li>10-15 qualified meetings booked per month</li>
                        <li>60%+ of your booked meetings result in proposals</li>
                        <li>Prospects arrive at discovery calls with context (they read our content)</li>
                        <li>You develop pattern recognition for ideal client profiles</li>
                        <li>Your outreach messages get responses (not just opens)</li>
                    </ul>
                </div>
            </section>

            {/* Our Sales Approach */}
            <section className="careers-section careers-bg-primary">
                <div className="careers-container">
                    <h2 className="careers-section-title">Our Sales Approach</h2>
                    <ul className="careers-philosophy-list">
                        <li><strong>Qualification over volume:</strong> We'd rather pass on poor fits than waste time</li>
                        <li><strong>Education-first outreach:</strong> We lead with value, not pitches</li>
                        <li><strong>Long sales cycles:</strong> 4-8 weeks from first contact to signed engagement</li>
                        <li><strong>Transparent pricing:</strong> We don't hide our rates—time is the real cost</li>
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
                                    Show us an outreach sequence you've run and the results it generated.
                                </div>
                            </div>
                        </div>
                        <div className="careers-process-step">
                            <div className="careers-process-number">2</div>
                            <div className="careers-process-content">
                                <div className="careers-process-title">Mock Outreach Exercise (~2 hours)</div>
                                <div className="careers-process-description">
                                    Research 5 target prospects and draft personalized outreach messages.
                                </div>
                            </div>
                        </div>
                        <div className="careers-process-step">
                            <div className="careers-process-number">3</div>
                            <div className="careers-process-content">
                                <div className="careers-process-title">Role Play & Review (60 min video)</div>
                                <div className="careers-process-description">
                                    Conduct a mock discovery call, then discuss your outreach exercise.
                                </div>
                            </div>
                        </div>
                        <div className="careers-process-step">
                            <div className="careers-process-number">4</div>
                            <div className="careers-process-content">
                                <div className="careers-process-title">Culture & Comp Discussion (45 min video)</div>
                                <div className="careers-process-description">
                                    Meet John (CEO) to align on sales philosophy, commission structure, and growth path.
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
                            your resume, and show us an outreach sequence you've used—include the results it generated.
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
