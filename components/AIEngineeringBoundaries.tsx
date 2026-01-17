export default function AIEngineeringBoundaries() {
    return (
        <section className="ai-eng-section ai-eng-bg-alternate">
            <div className="container">
                <h2 className="ai-eng-section-title">Boundaries</h2>

                <div className="ai-eng-capability-grid">
                    <div>
                        <div className="ai-eng-card-number">EXCLUDED</div>
                        <p className="ai-eng-subsection-title">The MVP Mentality</p>
                        <p className="ai-eng-body-text" style={{ fontSize: '1rem' }}>
                            We do not build prototypes for internal validation. We build systems designed for institutional durability and long-term maintenance.
                        </p>
                    </div>
                    <div>
                        <div className="ai-eng-card-number">EXCLUDED</div>
                        <p className="ai-eng-subsection-title">Feature-Level Contracting</p>
                        <p className="ai-eng-body-text" style={{ fontSize: '1rem' }}>
                            We do not accept engagements defined by UI/UX feature lists. We solve architectural bottlenecks and integration logic.
                        </p>
                    </div>
                    <div>
                        <div className="ai-eng-card-number">EXCLUDED</div>
                        <p className="ai-eng-subsection-title">Static Implementation</p>
                        <p className="ai-eng-body-text" style={{ fontSize: '1rem' }}>
                            We do not deliver code that lacks a governance framework. Every engineering output includes a technical maintenance and evolution plan.
                        </p>
                    </div>
                </div>

                <p className="ai-eng-body-text ai-eng-mt-5">
                    Organizations that treat AI as a feature-set create technical debt. Institutional AI requires systems that survive team turnover and model evolution. We maintain these boundaries to protect architectural integrity.
                </p>
            </div>
        </section>
    );
}
