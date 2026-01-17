export default function AIEngineeringFAQ() {
    return (
        <section className="ai-eng-section ai-eng-bg-primary">
            <div className="container">
                <h2 className="ai-eng-section-title">Technical FAQ</h2>

                <div className="ai-eng-two-col-grid">
                    <div>
                        <div className="ai-eng-faq-item">
                            <div className="ai-eng-faq-question">How do you handle the transition from your team to our internal engineers?</div>
                            <p className="ai-eng-faq-answer">
                                We don&apos;t &quot;hand over&quot; code. We build the documentation and governance frameworks alongside your team. Transition is a continuous process of technical knowledge transfer.
                            </p>
                        </div>
                        <div className="ai-eng-faq-item">
                            <div className="ai-eng-faq-question">Do you sign SLAs for the performance of third-party models?</div>
                            <p className="ai-eng-faq-answer">
                                No. We sign SLAs for the architecture we build around those models. We design systems to be model-agnostic so your infrastructure survives vendor shifts.
                            </p>
                        </div>
                        <div className="ai-eng-faq-item">
                            <div className="ai-eng-faq-question">How do you justify the cost over a standard staff augmentation firm?</div>
                            <p className="ai-eng-faq-answer">
                                Staff augmentation increases headcount. IntraWeb increases technical judgment. We reduce the long-term cost of technical debt by preventing architectural drift before it begins.
                            </p>
                        </div>
                    </div>

                    <div>
                        <div className="ai-eng-faq-item">
                            <div className="ai-eng-faq-question">What is the typical surface area of an engineering engagement?</div>
                            <p className="ai-eng-faq-answer">
                                We focus on the high-friction boundaries: API orchestration, data pipeline integrity, and secure model deployment. We leave frontend UI development to your internal product teams.
                            </p>
                        </div>
                        <div className="ai-eng-faq-item">
                            <div className="ai-eng-faq-question">Can we hire you for a single sprint to build a proof-of-concept?</div>
                            <p className="ai-eng-faq-answer">
                                No. Proof-of-concept work belongs to marketing. Our engagements require a minimum timeline sufficient to ensure the system is institutionally viable.
                            </p>
                        </div>
                        <div className="ai-eng-faq-item">
                            <div className="ai-eng-faq-question">Who owns the intellectual property?</div>
                            <p className="ai-eng-faq-answer">
                                The organization. We build proprietary assets, not leased services. All architecture and logic remain institutional property upon completion.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
