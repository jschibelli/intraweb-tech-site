export default function AIEngineeringCTA() {
    return (
        <section className="ai-eng-section ai-eng-bg-lighter">
            <div className="container" style={{ textAlign: 'center' }}>
                <h2 className="ai-eng-section-title" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', marginBottom: '1.5rem' }}>
                    Ready to discuss technical requirements?
                </h2>
                <p className="ai-eng-body-text ai-eng-text-muted" style={{ marginBottom: '2rem' }}>
                    Engineering conversations begin with specificity. Bring your constraints.
                </p>
                <a href="/contact" className="ai-eng-btn-primary">Initiate Conversation</a>
            </div>
        </section>
    );
}
