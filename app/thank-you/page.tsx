"use client";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function ThankYouPage() {
    return (
        <main className="bg-gray-900 text-white min-h-screen flex items-center justify-center px-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 pointer-events-none select-none" style={{ backgroundImage: 'url(/circuit-pattern.svg)', backgroundRepeat: 'repeat', backgroundSize: 'auto' }}>
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500 opacity-20 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-500 opacity-20 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative max-w-2xl mx-auto text-center space-y-8">
                <div className="flex justify-center">
                    <CheckCircle className="w-24 h-24 text-teal-400" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold">
                        Thank You!
                    </h1>
                    <p className="text-xl text-gray-300">
                        We've received your request and will be in touch shortly.
                    </p>
                </div>

                <div className="space-y-4 text-gray-300">
                    <h2 className="text-2xl font-heading font-semibold text-white">What happens next?</h2>
                    <ul className="space-y-3 text-left max-w-lg mx-auto">
                        <li className="flex items-start">
                            <span className="text-teal-400 mr-3 mt-1">→</span>
                            <span>Our team will review your submission within 24 hours.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-teal-400 mr-3 mt-1">→</span>
                            <span>We'll reach out to schedule a diagnostic call to understand your needs.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-teal-400 mr-3 mt-1">→</span>
                            <span>You'll receive a tailored proposal outlining how we can help transform your business.</span>
                        </li>
                    </ul>
                </div>

                <div className="pt-8">
                    <Link
                        href="/"
                        className="inline-block px-8 py-3 bg-orange-500 hover:bg-teal-500 text-white font-semibold rounded-md transition-colors"
                    >
                        Return to Home
                    </Link>
                </div>
            </div>
        </main>
    );
}
