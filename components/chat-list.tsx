"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatTimestamp } from "@/lib/utils";

interface ChatListProps {
    onSelectConversation: (id: any) => void;
    selectedId?: string;
}

export function ChatList({ onSelectConversation, selectedId }: ChatListProps) {
    const conversations = useQuery(api.conversations.getMyConversations);

    if (!conversations) {
        return <div className="p-4 text-gray-500 text-sm">Loading chats...</div>;
    }

    if (conversations.length === 0) {
        return (
            <div className="p-4 text-center mt-10">
                <p className="text-gray-500 text-sm">No chats yet</p>
                <p className="text-xs text-blue-500 mt-2">Search for users to start chatting!</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
                <div
                    key={conv._id}
                    onClick={() => onSelectConversation(conv._id)}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors ${selectedId === conv._id ? "bg-blue-50" : ""
                        }`}
                >
                    <img
                        src={conv.otherUser?.image}
                        alt={conv.otherUser?.name}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                            <h3 className="font-semibold text-sm truncate">{conv.otherUser?.name}</h3>
                            <span className="text-[10px] text-gray-400">
                                {formatTimestamp(conv.lastMessageTime)}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
