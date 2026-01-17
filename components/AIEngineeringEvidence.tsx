export default function AIEngineeringEvidence() {
    return (
        <section className="ai-eng-section ai-eng-bg-alternate">
            <div className="container">
                <h2 className="ai-eng-section-title">Technical Evidence</h2>

                <div className="ai-eng-two-col-grid">
                    <div className="ai-eng-proof-point">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="9" y1="9" x2="15" y2="9"></line>
                                <line x1="9" y1="15" x2="15" y2="15"></line>
                            </svg>
                            <div className="ai-eng-proof-label" style={{ margin: 0 }}>Workant Platform</div>
                        </div>
                        <p className="ai-eng-proof-description">
                            Workant represents a structural solve for workforce management. We moved beyond simple LLM wrappers to build a retrieval-augmented generation (RAG) system that prioritizes data privacy and auditability.
                        </p>
                        <p className="ai-eng-proof-status">Status: Active development, production usage</p>
                    </div>

                    <div className="ai-eng-proof-point">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                                <path d="M2 17l10 5 10-5"></path>
                                <path d="M2 12l10 5 10-5"></path>
                            </svg>
                            <div className="ai-eng-proof-label" style={{ margin: 0 }}>Client Infrastructure</div>
                        </div>
                        <p className="ai-eng-proof-description">
                            For organizations with high-security constraints, we deploy local-first AI architectures. This removes dependency on third-party API availability and keeps proprietary data within the institutional firewall.
                        </p>
                        <p className="ai-eng-proof-status">Deployment: On-premise, air-gapped environments</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
