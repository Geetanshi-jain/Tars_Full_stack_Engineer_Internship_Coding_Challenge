"use client";

import { MessageSquare } from "lucide-react";

export default function ChatEmptyPage() {
    return (
        <div className="flex-1 flex items-center justify-center text-center p-10 bg-gray-50">
            <div>
                <div className="bg-white p-6 rounded-full inline-block shadow-sm mb-4">
                    <MessageSquare className="w-12 h-12 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Your Conversations</h2>
                <p className="text-gray-500 mt-2 max-w-xs mx-auto">
                    Select a chat from the sidebar to start messaging your friends in real-time.
                </p>
            </div>
        </div>
    );
}
