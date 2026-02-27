"use client";

import { formatTimestamp } from "@/lib/utils";

interface MessageBoxProps {
    content: string;
    timestamp: number;
    isSender: boolean;
}

export function MessageBox({ content, timestamp, isSender }: MessageBoxProps) {
    return (
        <div className={`flex flex-col mb-4 ${isSender ? "items-end" : "items-start"}`}>
            <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${isSender
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-gray-200 text-gray-800 rounded-tl-none"
                    }`}
            >
                {content}
            </div>
            <span className="text-[10px] text-gray-400 mt-1 px-1">
                {formatTimestamp(timestamp)}
            </span>
        </div>
    );
}
