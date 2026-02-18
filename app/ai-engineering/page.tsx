import AIEngineeringHero from "../../components/AIEngineeringHero";
import AIEngineeringBoundaries from "../../components/AIEngineeringBoundaries";
import AIEngineeringWhenApplies from "../../components/AIEngineeringWhenApplies";
import AIEngineeringCapabilities from "../../components/AIEngineeringCapabilities";
import AIEngineeringEngagement from "../../components/AIEngineeringEngagement";
import AIEngineeringEvidence from "../../components/AIEngineeringEvidence";
import AIEngineeringFAQ from "../../components/AIEngineeringFAQ";
import AIEngineeringCTA from "../../components/AIEngineeringCTA";

export default function AIEngineeringPage() {
    return (
        <main>
            <AIEngineeringHero />
            <AIEngineeringBoundaries />

            {/* Divider */}
            <div style={{ padding: 0 }}>
                <hr className="ai-eng-horizontal-rule" />
            </div>

            <AIEngineeringWhenApplies />
            <AIEngineeringCapabilities />

            {/* Divider */}
            <div style={{ padding: 0 }}>
                <hr className="ai-eng-horizontal-rule" />
            </div>

            <AIEngineeringEngagement />
            <AIEngineeringEvidence />

            {/* Divider */}
            <div style={{ padding: 0 }}>
                <hr className="ai-eng-horizontal-rule" />
            </div>

            <AIEngineeringFAQ />

            {/* Divider */}
            <div style={{ padding: 0 }}>
                <hr className="ai-eng-horizontal-rule" />
            </div>

            <AIEngineeringCTA />
        </main>
    );
}
