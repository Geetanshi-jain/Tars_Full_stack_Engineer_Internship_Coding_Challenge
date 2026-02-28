"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatTimestamp } from "@/lib/utils";
import { SidebarSkeleton } from "@/components/skeleton-loader";
import { Users } from "lucide-react";

interface ChatListProps {
    onSelectConversation: (id: any) => void;
    selectedId?: string;
}

export function ChatList({ onSelectConversation, selectedId }: ChatListProps) {
    const conversations = useQuery(api.conversations.getMyConversations);
    const onlineUsers = useQuery(api.presence.getOnlineUsers) || [];

    if (conversations === undefined) {
        return <SidebarSkeleton />;
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
            {conversations.map((conv) => {
                const isGroup = conv.type === "group";
                const isOnline = !isGroup && onlineUsers.some((u: any) => u._id === conv.otherUser?._id);
                const displayName = isGroup ? conv.groupName : conv.otherUser?.name;
                const avatarUrl = isGroup ? null : conv.otherUser?.image;
                const subtitle = isGroup ? `${conv.memberCount} members` : null;

                return (
                    <div
                        key={conv._id}
                        onClick={() => onSelectConversation(conv._id)}
                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors relative ${selectedId === conv._id ? "bg-blue-50" : ""
                            }`}
                    >
                        <div className="relative">
                            {isGroup ? (
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                    <Users className="w-6 h-6 text-blue-500" />
                                </div>
                            ) : (
                                <img
                                    src={avatarUrl || ""}
                                    alt={displayName || ""}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            )}
                            {isOnline && (
                                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                                <h3 className="font-semibold text-sm truncate">{displayName}</h3>
                                <span className="text-[10px] text-gray-400">
                                    {formatTimestamp(conv.lastMessageTime)}
                                </span>
                            </div>
                            {subtitle && (
                                <p className="text-[10px] text-blue-400 font-medium">{subtitle}</p>
                            )}
                            <div className="flex justify-between items-center mt-0.5">
                                <p className={`text-xs truncate ${conv.unreadCount > 0 && selectedId !== conv._id ? "text-gray-900 font-semibold" : "text-gray-500"}`}>
                                    {conv.lastMessage}
                                </p>
                                {conv.unreadCount > 0 && selectedId !== conv._id && (
                                    <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                        {conv.unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
