import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export default function AboutEngagementComparison() {
    return (
        <div className="my-8">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Good Fit Column */}
                <div className="bg-[#0d2b42] border-l-4 border-[#14b8a6] rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <CheckCircle2 className="w-6 h-6 text-[#14b8a6]" />
                        <h3 className="text-lg font-heading font-semibold text-white">Good Fit</h3>
                    </div>
                    <ul className="space-y-3 text-[#e0e0e0] text-sm">
                        <li className="flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[#14b8a6] flex-shrink-0 mt-0.5" />
                            <span>Organizations seeking architectural judgment, not execution capacity</span>
                        </li>
                        <li className="flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[#14b8a6] flex-shrink-0 mt-0.5" />
                            <span>Willingness to redesign processes, not just automate existing ones</span>
                        </li>
                        <li className="flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[#14b8a6] flex-shrink-0 mt-0.5" />
                            <span>Executive sponsorship and cross-functional participation available</span>
                        </li>
                        <li className="flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[#14b8a6] flex-shrink-0 mt-0.5" />
                            <span>Commitment to governance frameworks and institutional durability</span>
                        </li>
                    </ul>
                </div>

                {/* Not For Us Column */}
                <div className="bg-[#0d2b42] border-l-4 border-[#fb923c] rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <XCircle className="w-6 h-6 text-[#fb923c]" />
                        <h3 className="text-lg font-heading font-semibold text-white">Not For Us</h3>
                    </div>
                    <ul className="space-y-3 text-[#e0e0e0] text-sm">
                        <li className="flex gap-3">
                            <XCircle className="w-5 h-5 text-[#fb923c] flex-shrink-0 mt-0.5" />
                            <span>Vendor execution of predefined requirements without strategic input</span>
                        </li>
                        <li className="flex gap-3">
                            <XCircle className="w-5 h-5 text-[#fb923c] flex-shrink-0 mt-0.5" />
                            <span>Expectation of AI adoption without operational change</span>
                        </li>
                        <li className="flex gap-3">
                            <XCircle className="w-5 h-5 text-[#fb923c] flex-shrink-0 mt-0.5" />
                            <span>Fixed timelines treating AI as cost-reduction initiative</span>
                        </li>
                        <li className="flex gap-3">
                            <XCircle className="w-5 h-5 text-[#fb923c] flex-shrink-0 mt-0.5" />
                            <span>Capability demonstrations requested before problem definition</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
