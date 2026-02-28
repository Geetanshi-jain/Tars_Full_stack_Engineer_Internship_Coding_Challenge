"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, UIEvent } from "react";
import { MessageBox } from "@/components/message-box";
import { SkeletonLoader } from "@/components/skeleton-loader";
import { ArrowLeft, Send } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export default function ChatPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useUser();
    const [content, setContent] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const [pendingContent, setPendingContent] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [showNewMessageButton, setShowNewMessageButton] = useState(false);
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);

    const messages = useQuery(api.messages.getMessages, { conversationId: id as Id<"conversations"> });
    const sendMessage = useMutation(api.messages.sendMessage);
    const markAsRead = useMutation(api.messages.markAsRead);
    const convexUser = useQuery(api.users.currentUser, { clerkId: user?.id || "" });
    const conversation = useQuery(api.conversations.getMyConversations);
    const currentConv = conversation?.find((c) => c._id === id);

    const setTypingMutation = useMutation(api.typing.setTyping);
    const typingUsers = useQuery(api.typing.getTypingUsers, { conversationId: id as any }) || [];
    const otherTypingUsers = typingUsers.filter((u: any) => u && u._id !== convexUser?._id);

    useEffect(() => {
        if (messages) {
            markAsRead({ conversationId: id as Id<"conversations"> }).catch(console.error);
            if (isAtBottom) {
                scrollRef.current?.scrollIntoView({ behavior: "smooth" });
            } else {
                if (messages.length > 0) setShowNewMessageButton(true);
            }
        }
    }, [messages, id, isAtBottom]);

    const handleScroll = (e: UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        const bottom = Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 10;
        setIsAtBottom(bottom);
        if (bottom) setShowNewMessageButton(false);
    };

    const scrollToBottom = () => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        setShowNewMessageButton(false);
        setIsAtBottom(true);
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContent(e.target.value);
        setTypingMutation({ conversationId: id as any, isTyping: true }).catch(console.error);
        if (typingTimeout.current) clearTimeout(typingTimeout.current);
        typingTimeout.current = setTimeout(() => {
            setTypingMutation({ conversationId: id as any, isTyping: false }).catch(console.error);
        }, 2000);
    };

    const doSend = async (text: string) => {
        setIsSending(true);
        setSendError(null);
        try {
            if (typingTimeout.current) clearTimeout(typingTimeout.current);
            setTypingMutation({ conversationId: id as any, isTyping: false }).catch(console.error);
            await sendMessage({ conversationId: id as Id<"conversations">, content: text });
            setPendingContent(null);
            scrollToBottom();
        } catch (e) {
            setSendError("Failed to send message.");
            setPendingContent(text);
        } finally {
            setIsSending(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        const sentContent = content.trim();
        setContent("");
        await doSend(sentContent);
    };

    // Derive header title
    const headerTitle = currentConv?.type === "group"
        ? (currentConv?.groupName || "Group Chat")
        : (currentConv?.otherUser?.name || "Chat");

    const headerSubtitle = currentConv?.type === "group"
        ? `${currentConv?.memberCount} members`
        : "Real-time Connected";

    return (
        <div className="flex flex-col h-full bg-white flex-1 overflow-hidden relative">
            {/* Header */}
            <header className="px-4 py-3 border-b flex items-center gap-4 bg-white sticky top-0 z-10 shadow-sm">
                <button
                    onClick={() => router.push("/chat")}
                    className="p-2 hover:bg-gray-100 rounded-full md:hidden"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="flex-1">
                    <h1 className="font-bold text-gray-800">{headerTitle}</h1>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">{headerSubtitle}</p>
                </div>
            </header>

            {/* Messages */}
            <div
                className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-1 relative"
                onScroll={handleScroll}
                ref={containerRef}
            >
                {messages === undefined ? (
                    <SkeletonLoader />
                ) : messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((m) => (
                        <MessageBox
                            key={m._id}
                            messageId={m._id}
                            content={m.content}
                            timestamp={m._creationTime}
                            isSender={m.senderId === convexUser?._id}
                            isDeleted={m.isDeleted}
                        />
                    ))
                )}

                {/* Pending (failed) message */}
                {pendingContent && sendError && (
                    <div className="flex flex-col items-end mb-3">
                        <div className="max-w-[75%] px-4 py-2 rounded-2xl text-sm bg-blue-400 text-white rounded-tr-none opacity-70">
                            {pendingContent}
                        </div>
                        <div className="text-xs text-red-500 mt-1 flex gap-2 items-center">
                            ⚠ Failed to send.
                            <button
                                onClick={() => doSend(pendingContent)}
                                className="underline font-semibold"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Typing indicator */}
                {otherTypingUsers.length > 0 && (
                    <div className="text-xs text-gray-500 italic mt-2 ml-2 flex items-center gap-1">
                        <span className="flex gap-1 items-center bg-gray-200 px-3 py-1.5 rounded-2xl w-fit">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></span>
                        </span>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {showNewMessageButton && (
                <button
                    onClick={scrollToBottom}
                    className="absolute bottom-20 right-1/2 translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-md hover:bg-blue-700 transition"
                >
                    ↓ New messages
                </button>
            )}

            {/* Input */}
            <form
                onSubmit={handleSend}
                className="p-4 border-t bg-white flex gap-2 items-center"
            >
                <input
                    type="text"
                    value={content}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-transparent focus:bg-white"
                    suppressHydrationWarning
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-transform active:scale-95 disabled:opacity-50"
                    disabled={!content.trim() || isSending}
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}
