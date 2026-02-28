"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatTimestamp } from "@/lib/utils";
import { useState } from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

interface MessageBoxProps {
    messageId: Id<"messages">;
    content: string;
    timestamp: number;
    isSender: boolean;
    isDeleted?: boolean;
    sendError?: string | null;
    onRetry?: () => void;
}

export function MessageBox({ messageId, content, timestamp, isSender, isDeleted, sendError, onRetry }: MessageBoxProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const deleteMessage = useMutation(api.messages.deleteMessage);
    const toggleReaction = useMutation(api.reactions.toggleReaction);
    const reactions = useQuery(api.reactions.getReactions, { messageId }) || [];

    const handleDelete = async () => {
        setShowMenu(false);
        await deleteMessage({ messageId });
    };

    const handleReact = async (emoji: string) => {
        setShowEmojiPicker(false);
        await toggleReaction({ messageId, emoji });
    };

    if (isDeleted) {
        return (
            <div className={`flex flex-col mb-3 ${isSender ? "items-end" : "items-start"}`}>
                <div className="max-w-[75%] px-4 py-2 rounded-2xl text-sm bg-gray-100 text-gray-400 italic">
                    This message was deleted
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">{formatTimestamp(timestamp)}</span>
            </div>
        );
    }

    const reactionEntries = Object.entries(reactions);

    return (
        <div className={`flex flex-col mb-3 ${isSender ? "items-end" : "items-start"} group relative`}>
            <div className="relative flex items-end gap-1.5">
                {/* Emoji picker trigger — show on hover */}
                <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`text-gray-400 hover:text-gray-600 text-base opacity-0 group-hover:opacity-100 transition-opacity ${isSender ? "order-first" : "order-last"}`}
                    title="React"
                >
                    😊
                </button>

                {/* 3-dot menu for sender */}
                {isSender && (
                    <div className="relative order-first">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-600"
                        >
                            <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                        {showMenu && (
                            <div className="absolute bottom-full right-0 mb-1 bg-white border rounded-lg shadow-lg z-10 text-sm">
                                <button
                                    onClick={handleDelete}
                                    className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg w-full whitespace-nowrap"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Message bubble */}
                <div
                    className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${isSender
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-gray-200 text-gray-800 rounded-tl-none"
                        }`}
                >
                    {content}
                </div>
            </div>

            {/* Emoji picker popup */}
            {showEmojiPicker && (
                <div className={`flex gap-1 bg-white border rounded-full shadow-lg px-2 py-1.5 mt-1 z-10 ${isSender ? "mr-2" : "ml-2"}`}>
                    {EMOJIS.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => handleReact(emoji)}
                            className="text-lg hover:scale-125 transition-transform"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}

            {/* Reactions display */}
            {reactions.length > 0 && (
                <div className={`flex flex-wrap gap-1 mt-1 ${isSender ? "mr-2" : "ml-2"}`}>
                    {reactions.map(({ emoji, count, reacted }) => (
                        <button
                            key={emoji}
                            onClick={() => handleReact(emoji)}
                            className={`text-xs flex items-center gap-0.5 px-2 py-0.5 rounded-full border transition ${reacted ? "bg-blue-100 border-blue-300" : "bg-white border-gray-200"
                                }`}
                        >
                            {emoji} <span className="text-gray-600">{count}</span>
                        </button>
                    ))}
                </div>
            )}

            <span className="text-[10px] text-gray-400 mt-1 px-1">{formatTimestamp(timestamp)}</span>

            {/* Send error */}
            {sendError && (
                <div className="text-xs text-red-500 mt-1 flex gap-2 items-center">
                    ⚠ Failed to send.
                    {onRetry && (
                        <button onClick={onRetry} className="underline">Retry</button>
                    )}
                </div>
            )}
        </div>
    );
}
