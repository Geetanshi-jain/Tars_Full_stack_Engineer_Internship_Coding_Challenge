"use client";

import { Search } from "lucide-react";

interface UserSearchProps {
    onSearch: (term: string) => void;
}

export function UserSearch({ onSearch }: UserSearchProps) {
    return (
        <div className="relative mb-4">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
                type="text"
                placeholder="Search users..."
                className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) => onSearch(e.target.value)}
            />
        </div>
    );
}
