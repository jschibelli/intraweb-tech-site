import Link from 'next/link';

export const metadata = {
    title: "Marketing & Content Strategist | Careers at IntraWeb Technologies",
    description: "Own our go-to-market strategy and content engine. $95K-$125K, Remote (US preferred).",
    openGraph: {
        title: "Marketing & Content Strategist - IntraWeb Technologies",
        description: "Join our team as Marketing & Content Strategist. Develop content strategy, create case studies, and position IntraWeb in the operational transformation space.",
        type: "website",
        url: "https://intrawebtech.com/careers/marketing-content-strategist",
    },
};

export default function MarketingContentStrategistPage() {
    return (
        <main>
            {/* Hero Section */}
            <section className="careers-hero careers-bg-primary">
                <div className="careers-hero-pattern" aria-hidden="true" />
                <div className="careers-container careers-hero-content">
                    <Link href="/careers" className="careers-back-link">
                        All Positions
                    </Link>
                    <h1 className="careers-page-title">Marketing & Content Strategist</h1>
                    <p className="careers-lead-text" style={{ marginBottom: '1.5rem' }}>
                        Go-to-Market
                    </p>
                    <div className="careers-job-card-meta">
                        <span className="careers-badge careers-badge-type">Full-time</span>
                        <span className="careers-badge careers-badge-location">Remote (US preferred)</span>
                        <span className="careers-badge careers-badge-compensation">$95K-$125K</span>
                    </div>
                </div>
            </section>

            {/* What You'll Own */}
            <section className="careers-section careers-bg-alternate">
                <div className="careers-container">
                    <h2 className="careers-section-title">What You'll Own</h2>
                    <p className="careers-body-text">
                        Our go-to-market strategy, content engine, and positioning in the market. You're not a traditional marketer—you're
                        building credibility in a space (operational transformation via automation) that most people don't know exists yet.
                        This requires education, not persuasion.
                    </p>

                    <h3 className="careers-subsection-title">Core Responsibilities</h3>
                    <ul className="careers-list">
                        <li>Develop and execute content strategy: case studies, operator guides, automation playbooks</li>
                        <li>Manage website content and conversion optimization</li>
                        <li>Create sales enablement materials: pitch decks, one-pagers, ROI calculators</li>
                        <li>Build email nurture sequences and LinkedIn outreach campaigns</li>
                        <li>Coordinate with design and engineering on product marketing for Workant</li>
                        <li>Track marketing metrics: lead quality, conversion rates, content engagement</li>
                    </ul>

                    <h3 className="careers-subsection-title">Content You'll Create</h3>
                    <ul className="careers-list">
                        <li>Educational content explaining operational transformation concepts</li>
                        <li>Client case studies demonstrating measurable impact (time recovered, ROI)</li>
                        <li>Automation guides and playbooks for common SMB workflows</li>
                        <li>Positioning materials differentiating us from consultancies and dev agencies</li>
                        <li>Product marketing for Workant platform launch</li>
                    </ul>
                </div>
            </section>

            {/* What We Need */}
            <section className="careers-section careers-bg-primary">
                <div className="careers-container">
                    <h2 className="careers-section-title">What We Need From You</h2>

                    <h3 className="careers-subsection-title">Required</h3>
                    <ul className="careers-list careers-list-required">
                        <li>4+ years in B2B marketing, ideally for services or SaaS</li>
                        <li>Strong writing skills—you can explain complex concepts clearly</li>
                        <li>Experience with content marketing and SEO fundamentals</li>
                        <li>Comfortable with marketing tools (HubSpot, Google Analytics, email platforms)</li>
                        <li>Data-driven mindset—you measure what matters and iterate based on results</li>
                    </ul>

                    <h3 className="careers-subsection-title">Strongly Preferred</h3>
                    <ul className="careers-list careers-list-preferred">
                        <li>Background in consulting, operations, or process optimization</li>
                        <li>Experience marketing to operators and executives (not just marketers)</li>
                        <li>Understanding of SMB buying behavior</li>
                        <li>Familiarity with developer tools and SaaS go-to-market</li>
                    </ul>

                    <h3 className="careers-subsection-title">Bonus Points</h3>
                    <ul className="careers-list careers-list-bonus">
                        <li>You've built a content flywheel from scratch</li>
                        <li>You understand automation and can explain it to non-technical audiences</li>
                        <li>You've worked in early-stage startups and built 0→1</li>
                    </ul>
                </div>
            </section>

            {/* Why This Role Exists */}
            <section className="careers-section careers-bg-alternate">
                <div className="careers-container">
                    <h2 className="careers-section-title">Why This Role Exists</h2>
                    <p className="careers-body-text">
                        We're not selling a product people already know they need. We're educating a market on a better way to run operations.
                        Your job is to make "embedded operational transformation" a recognizable category, position IntraWeb as the credible choice,
                        and generate qualified leads.
                    </p>

                    <h3 className="careers-subsection-title">What Success Looks Like</h3>
                    <ul className="careers-success-list">
                        <li>Inbound leads who understand our value proposition before the first call</li>
                        <li>Content that gets shared by operators in our target market</li>
                        <li>Case studies that drive prospect conversations</li>
                        <li>Clear messaging that differentiates us from "just another consultancy"</li>
                        <li>Workant launch generates interest from our target developer audience</li>
                    </ul>
                </div>
            </section>

            {/* Our Marketing Philosophy */}
            <section className="careers-section careers-bg-primary">
                <div className="careers-container">
                    <h2 className="careers-section-title">Our Marketing Philosophy</h2>
                    <ul className="careers-philosophy-list">
                        <li><strong>Education over persuasion:</strong> We don't convince people they have problems—we help them solve known problems better</li>
                        <li><strong>Credibility over hype:</strong> Conservative projections, honest case studies, transparent pricing</li>
                        <li><strong>Operator-minded tone:</strong> No buzzwords, no fluff, no "synergy"</li>
                        <li><strong>Content that ages well:</strong> Build evergreen assets, not just timely campaigns</li>
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
                                    Show us something you've built—a content strategy, a successful campaign, a piece of writing that drove results.
                                </div>
                            </div>
                        </div>
                        <div className="careers-process-step">
                            <div className="careers-process-number">2</div>
                            <div className="careers-process-content">
                                <div className="careers-process-title">Strategy Assessment (~3 hours)</div>
                                <div className="careers-process-description">
                                    Develop a 90-day content plan for IntraWeb based on our positioning and target market.
                                </div>
                            </div>
                        </div>
                        <div className="careers-process-step">
                            <div className="careers-process-number">3</div>
                            <div className="careers-process-content">
                                <div className="careers-process-title">Strategy Presentation (60 min video)</div>
                                <div className="careers-process-description">
                                    Present your plan and defend your prioritization.
                                </div>
                            </div>
                        </div>
                        <div className="careers-process-step">
                            <div className="careers-process-number">4</div>
                            <div className="careers-process-content">
                                <div className="careers-process-title">Vision Alignment (45 min video)</div>
                                <div className="careers-process-description">
                                    Meet John (CEO) and discuss market positioning, content philosophy, and how you measure marketing success.
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
                            your resume, and show us something you've created—a content strategy, successful campaign, or writing samples that drove results.
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
