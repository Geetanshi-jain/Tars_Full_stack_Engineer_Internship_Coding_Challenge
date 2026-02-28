"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { X, Users } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface CreateGroupModalProps {
    onClose: () => void;
}

export function CreateGroupModal({ onClose }: CreateGroupModalProps) {
    const { user } = useUser();
    const router = useRouter();
    const [groupName, setGroupName] = useState("");
    const [selectedIds, setSelectedIds] = useState<Id<"users">[]>([]);
    const [isCreating, setIsCreating] = useState(false);

    const allUsers = useQuery(api.users.getUsers);
    const createGroup = useMutation(api.conversations.createGroup);

    const otherUsers = allUsers?.filter((u) => u.clerkId !== user?.id) || [];

    const toggleSelect = (id: Id<"users">) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleCreate = async () => {
        if (!groupName.trim() || selectedIds.length === 0) return;
        setIsCreating(true);
        try {
            const convId = await createGroup({
                groupName: groupName.trim(),
                memberIds: selectedIds,
            });
            onClose();
            router.push(`/chat/${convId}`);
        } catch (e) {
            console.error(e);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" /> New Group
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Group name..."
                    className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 mb-3"
                />

                <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-2">Add Members</p>
                <div className="max-h-48 overflow-y-auto flex flex-col gap-1">
                    {otherUsers.map((u) => (
                        <div
                            key={u._id}
                            onClick={() => toggleSelect(u._id)}
                            className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition ${selectedIds.includes(u._id) ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                                }`}
                        >
                            <img src={u.image} className="w-8 h-8 rounded-full" alt="" />
                            <span className="text-sm font-medium text-gray-700">{u.name}</span>
                            {selectedIds.includes(u._id) && (
                                <span className="ml-auto text-blue-500 text-xs font-bold">✓</span>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleCreate}
                    disabled={!groupName.trim() || selectedIds.length === 0 || isCreating}
                    className="w-full mt-4 bg-blue-600 text-white py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {isCreating ? "Creating..." : `Create Group (${selectedIds.length} members)`}
                </button>
            </div>
        </div>
    );
}
