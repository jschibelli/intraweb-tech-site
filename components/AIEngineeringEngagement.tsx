export default function AIEngineeringEngagement() {
    return (
        <section className="ai-eng-section ai-eng-bg-primary">
            <div className="container">
                <h2 className="ai-eng-section-title">Engagement Model</h2>

                {/* Visual Flow Diagram */}
                <div className="ai-eng-engagement-flow">
                    <div className="ai-eng-engagement-grid">
                        <div style={{ textAlign: 'center' }}>
                            <div className="ai-eng-engagement-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0a2236" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                            </div>
                            <div className="ai-eng-engagement-label">Technical Audit</div>
                            <div className="ai-eng-engagement-sublabel">Infrastructure assessment</div>
                        </div>

                        <div className="ai-eng-engagement-arrow">→</div>

                        <div style={{ textAlign: 'center' }}>
                            <div className="ai-eng-engagement-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0a2236" strokeWidth="2">
                                    <rect x="3" y="3" width="7" height="7"></rect>
                                    <rect x="14" y="3" width="7" height="7"></rect>
                                    <rect x="14" y="14" width="7" height="7"></rect>
                                    <rect x="3" y="14" width="7" height="7"></rect>
                                </svg>
                            </div>
                            <div className="ai-eng-engagement-label">Architecture Design</div>
                            <div className="ai-eng-engagement-sublabel">Integration planning</div>
                        </div>

                        <div className="ai-eng-engagement-arrow">→</div>

                        <div style={{ textAlign: 'center' }}>
                            <div className="ai-eng-engagement-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0a2236" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <div className="ai-eng-engagement-label">Systemic Delivery</div>
                            <div className="ai-eng-engagement-sublabel">Operational resilience</div>
                        </div>
                    </div>
                </div>

                <p className="ai-eng-body-text">
                    We function as an extension of technical leadership, not additional headcount. Engagements begin with infrastructure audit to identify integration surface area, security constraints, and architectural gaps.
                </p>
                <p className="ai-eng-body-text">
                    Unlike agencies, we do not work in isolation. We operate within your stack, using your version control and security standards, while providing the architectural judgment your internal teams may lack.
                </p>
                <p className="ai-eng-body-text">
                    Accountability is measured by system stability, integration success, and architectural adherence. We do not report on &quot;story points&quot; or &quot;velocity.&quot; We report on systemic readiness and operational resilience.
                </p>
            </div>
        </section>
    );
}
