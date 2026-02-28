"use client";

export function SkeletonLoader() {
    return (
        <div className="flex flex-col gap-3 p-4 animate-pulse">
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    className={`flex gap-2 ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                >
                    <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                    <div className={`flex flex-col gap-1 max-w-[60%] ${i % 2 === 0 ? "items-start" : "items-end"}`}>
                        <div
                            className="h-4 rounded-full bg-gray-200"
                            style={{ width: `${80 + Math.random() * 80}px` }}
                        />
                        <div
                            className="h-4 rounded-full bg-gray-200"
                            style={{ width: `${60 + Math.random() * 60}px` }}
                        />
                        <div className="h-3 w-12 rounded bg-gray-100" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function SidebarSkeleton() {
    return (
        <div className="flex-1 overflow-y-auto animate-pulse">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 flex flex-col gap-1.5">
                        <div className="h-3.5 w-28 rounded bg-gray-200" />
                        <div className="h-3 w-40 rounded bg-gray-100" />
                    </div>
                </div>
            ))}
        </div>
    );
}
