import React from "react";
import Image from "next/image";
import { Linkedin } from "lucide-react";

export default function AboutProfileCard() {
    return (
        <div className="my-12 p-8 bg-[#0d2b42] border border-[#13293d] border-l-4 border-l-[#14b8a6] rounded-lg">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                    <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-[#14b8a6]">
                        <Image
                            src="/20240425_082101.jpg"
                            alt="John Schibelli - Founder & Principal"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                    <h3 className="text-2xl font-heading font-semibold text-white mb-2">
                        John Schibelli
                    </h3>
                    <p className="text-[#14b8a6] font-medium mb-4">
                        Founder & Principal
                    </p>
                    <p className="text-[#e0e0e0] leading-relaxed mb-4">
                        John founded IntraWeb Technologies to address the structural gap between AI strategy and AI implementation. With expertise spanning organizational transformation and systems architecture, he works directly with clients to ensure AI adoption aligns with institutional realities.
                    </p>
                    <a
                        href="https://www.linkedin.com/in/johnschibelli"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[#14b8a6] hover:text-[#fb923c] transition-colors"
                    >
                        <Linkedin className="w-5 h-5" />
                        <span className="font-medium">Connect on LinkedIn</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
