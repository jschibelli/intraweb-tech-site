export default function AIEngineeringHero() {
    return (
        <section className="ai-eng-hero">
            {/* Pentagon pattern background */}
            <div className="ai-eng-hero-pattern"></div>
            {/* Top shadow */}
            <div className="ai-eng-hero-shadow-top"></div>
            {/* Bottom shadow */}
            <div className="ai-eng-hero-shadow-bottom"></div>

            <div className="container ai-eng-hero-content">
                <h1 className="ai-eng-page-title">Systems Architecture for Institutional AI</h1>
                <p className="ai-eng-lead-text">
                    Most transformation firms stop at recommendations. We execute the technical architecture required to integrate AI into institutional systems—whether that work stems from our diagnostic engagements or your internal requirements.
                </p>
                <div className="ai-eng-negation-block">
                    <p>
                        This is not a development shop. We do not provide staff augmentation, offshore capacity, or feature-based contracting. We own architectural outcomes, not delivery tickets.
                    </p>
                </div>
                <a href="/contact" className="ai-eng-btn-primary">Discuss Engineering Requirements</a>
            </div>
        </section>
    );
}
