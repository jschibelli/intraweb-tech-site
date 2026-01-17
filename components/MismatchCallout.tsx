import React from "react";
import { AlertTriangle } from "lucide-react";

interface MismatchCalloutProps {
    children: React.ReactNode;
}

export default function MismatchCallout({ children }: MismatchCalloutProps) {
    return (
        <div className="my-6 p-6 bg-[#fb923c]/10 border-l-4 border-[#fb923c] rounded-r-lg">
            <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-[#fb923c] flex-shrink-0 mt-1" />
                <div className="flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}
