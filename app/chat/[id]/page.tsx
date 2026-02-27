"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { MessageBox } from "@/components/message-box";
import { ArrowLeft, Send } from "lucide-react";

export default function ChatPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useUser();
    const [content, setContent] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const messages = useQuery(api.messages.getMessages, {
        conversationId: id as any
    });
    const sendMessage = useMutation(api.messages.sendMessage);
    const convexUser = useQuery(api.users.currentUser, { clerkId: user?.id || "" });

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        await sendMessage({
            conversationId: id as any,
            content: content.trim(),
        });
        setContent("");
    };

    if (!messages || !convexUser) return (
        <div className="flex-1 flex items-center justify-center text-gray-500">Loading conversation...</div>
    );

    return (
        <div className="flex flex-col h-full bg-white flex-1 overflow-hidden">
            {/* Header */}
            <header className="px-4 py-3 border-b flex items-center gap-4 bg-white sticky top-0 z-10 shadow-sm">
                <button
                    onClick={() => router.push("/chat")}
                    className="p-2 hover:bg-gray-100 rounded-full md:hidden"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex-1">
                    <h1 className="font-bold text-gray-800">Chat</h1>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Real-time Connected</p>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-2">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                        No messages found. Start the conversation!
                    </div>
                ) : (
                    messages.map((m) => (
                        <MessageBox
                            key={m._id}
                            content={m.content}
                            timestamp={m._creationTime}
                            isSender={m.senderId === convexUser._id}
                        />
                    ))
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={handleSend}
                className="p-4 border-t bg-white flex gap-2 items-center"
            >
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-transparent focus:bg-white"
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-transform active:scale-95 disabled:opacity-50"
                    disabled={!content.trim()}
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}
