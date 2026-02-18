export default function AIEngineeringCapabilities() {
    return (
        <section className="ai-eng-section ai-eng-bg-primary">
            <div className="ai-eng-wide-container">
                <h2 className="ai-eng-section-title">Technical Capabilities</h2>

                <div className="ai-eng-capability-grid">
                    <div className="ai-eng-capability-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="ai-eng-capability-number">01</div>
                            <h3 className="ai-eng-card-title" style={{ margin: 0 }}>Integration Architecture</h3>
                        </div>
                        <p className="ai-eng-body-text" style={{ fontSize: '0.95rem', marginBottom: '1rem', color: '#d0d0d0' }}>
                            We do not &quot;connect apps.&quot; We design the middle-tier logic that allows LLMs to interact safely with legacy databases and proprietary data silos without compromising security protocols.
                        </p>
                        <ul className="ai-eng-card-list">
                            <li>API orchestration and governance</li>
                            <li>MCP server implementation</li>
                            <li>Secure data pipeline design</li>
                            <li>Legacy system modernization</li>
                        </ul>
                    </div>

                    <div className="ai-eng-capability-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="ai-eng-capability-number">02</div>
                            <h3 className="ai-eng-card-title" style={{ margin: 0 }}>Automation Engineering</h3>
                        </div>
                        <p className="ai-eng-body-text" style={{ fontSize: '0.95rem', marginBottom: '1rem', color: '#d0d0d0' }}>
                            This is not about script writing. We build automation infrastructure that monitors agent behavior, surfaces failure modes early, and maintains operational visibility within your existing CI/CD pipelines.
                        </p>
                        <ul className="ai-eng-card-list">
                            <li>Workflow automation architecture</li>
                            <li>Agent monitoring systems</li>
                            <li>Process orchestration (n8n)</li>
                            <li>CI/CD integration logic</li>
                        </ul>
                    </div>

                    <div className="ai-eng-capability-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div className="ai-eng-capability-number">03</div>
                            <h3 className="ai-eng-card-title" style={{ margin: 0 }}>Platform Development</h3>
                        </div>
                        <p className="ai-eng-body-text" style={{ fontSize: '0.95rem', marginBottom: '1rem', color: '#d0d0d0' }}>
                            We do not build stand-alone applications. We develop the foundational platforms that allow your internal engineering teams to deploy and manage AI capabilities across multiple business units.
                        </p>
                        <ul className="ai-eng-card-list">
                            <li>Multi-tenant platform architecture</li>
                            <li>Database design (Postgres, Prisma)</li>
                            <li>Authentication infrastructure</li>
                            <li>Model deployment frameworks</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
