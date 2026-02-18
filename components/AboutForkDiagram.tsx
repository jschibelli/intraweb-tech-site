import React from "react";

export default function AboutForkDiagram() {
    return (
        <div className="my-8 p-8 bg-[#0d2b42] rounded-lg border border-[#13293d]">
            <div className="max-w-4xl mx-auto">
                {/* Top: Client Problem Space */}
                <div className="text-center mb-8">
                    <div className="inline-block px-6 py-3 bg-[#0a2236] border-2 border-[#14b8a6] rounded-lg">
                        <p className="text-white font-medium">Client Problem Space</p>
                    </div>
                </div>

                {/* Fork Arrow */}
                <div className="flex justify-center mb-8">
                    <svg width="120" height="60" viewBox="0 0 120 60" className="text-[#14b8a6]">
                        <line x1="60" y1="0" x2="60" y2="30" stroke="currentColor" strokeWidth="2" />
                        <line x1="60" y1="30" x2="20" y2="60" stroke="currentColor" strokeWidth="2" />
                        <line x1="60" y1="30" x2="100" y2="60" stroke="currentColor" strokeWidth="2" />
                        <circle cx="60" cy="30" r="4" fill="currentColor" />
                    </svg>
                </div>

                {/* Two Paths */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* AI Transformation */}
                    <div className="bg-[#0a2236] border-2 border-[#14b8a6] rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-[#14b8a6] rounded-lg flex items-center justify-center text-[#0a2236] font-bold text-xl">
                                T
                            </div>
                            <h3 className="text-xl font-heading font-semibold text-white">AI Transformation</h3>
                        </div>
                        <ul className="space-y-2 text-[#e0e0e0] text-sm">
                            <li className="flex gap-2">
                                <span className="text-[#14b8a6]">•</span>
                                <span>Decision-making frameworks</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#14b8a6]">•</span>
                                <span>Organizational readiness</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#14b8a6]">•</span>
                                <span>Governance structure</span>
                            </li>
                        </ul>
                    </div>

                    {/* AI Engineering */}
                    <div className="bg-[#0a2236] border-2 border-[#14b8a6] rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-[#14b8a6] rounded-lg flex items-center justify-center text-[#0a2236] font-bold text-xl">
                                E
                            </div>
                            <h3 className="text-xl font-heading font-semibold text-white">AI Engineering</h3>
                        </div>
                        <ul className="space-y-2 text-[#e0e0e0] text-sm">
                            <li className="flex gap-2">
                                <span className="text-[#14b8a6]">•</span>
                                <span>System architecture</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#14b8a6]">•</span>
                                <span>Production implementation</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[#14b8a6]">•</span>
                                <span>Performance optimization</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Note */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-[#14b8a6] font-medium">
                        Structurally different problems requiring different expertise
                    </p>
                </div>
            </div>
        </div>
    );
}
