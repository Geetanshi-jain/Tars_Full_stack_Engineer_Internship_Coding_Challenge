"use client";

import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { UserSearch } from "@/components/user-search";
import { ChatList } from "@/components/chat-list";
import { Plus, ShieldAlert } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const { isAuthenticated, isLoading } = useConvexAuth();
    const router = useRouter();
    const params = useParams();
    const [searchTerm, setSearchTerm] = useState("");

    const allUsers = useQuery(api.users.getUsers);
    const startConversation = useMutation(api.conversations.startConversation);

    const filteredUsers = allUsers?.filter(
        (u) =>
            u.clerkId !== user?.id &&
            u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleStartChat = async (userId: any) => {
        const conversationId = await startConversation({ participantTwoId: userId });
        setSearchTerm("");
        router.push(`/chat/${conversationId}`);
    };

    const isChatOpen = !!params.id;

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar - hidden on mobile when chat is open */}
            <div className={`w-full md:w-80 bg-white border-r flex flex-col ${isChatOpen ? "hidden md:flex" : "flex"}`}>
                <div className="p-4 border-b flex justify-between items-center">
                    <h1 className="text-xl font-bold text-blue-600">Messages</h1>
                    <UserButton afterSignOutUrl="/" />
                </div>

                {/* Auth Error Banner */}
                {!isAuthenticated && !isLoading && (
                    <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 shadow-sm">
                        <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        <div className="text-[10px] text-red-600 leading-tight">
                            <strong>Convex Auth Failed</strong><br />
                            Please check your Clerk JWT Template. "Audience" must be set to <strong>convex</strong>.
                        </div>
                    </div>
                )}

                <div className="p-4 pb-0">
                    <UserSearch onSearch={setSearchTerm} />
                </div>

                {searchTerm ? (
                    <div className="flex-1 overflow-y-auto">
                        <h2 className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Search Results
                        </h2>
                        {filteredUsers?.length === 0 ? (
                            <p className="px-4 py-2 text-sm text-gray-500">No users found</p>
                        ) : (
                            filteredUsers?.map((u) => (
                                <div
                                    key={u._id}
                                    onClick={() => handleStartChat(u._id)}
                                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50"
                                >
                                    <img src={u.image} className="w-10 h-10 rounded-full" alt="" />
                                    <span className="text-sm font-medium">{u.name}</span>
                                    <Plus className="ml-auto w-4 h-4 text-blue-500" />
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <ChatList
                        onSelectConversation={(id) => router.push(`/chat/${id}`)}
                        selectedId={params.id as string}
                    />
                )}
            </div>

            {/* Main Area */}
            <div className={`flex-1 ${!isChatOpen ? "hidden md:flex" : "flex"}`}>
                {children}
            </div>
        </div>
    );
}
