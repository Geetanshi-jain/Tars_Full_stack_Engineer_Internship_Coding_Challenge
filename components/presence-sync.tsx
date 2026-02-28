"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function PresenceSync() {
    const heartbeat = useMutation(api.presence.heartbeat);

    useEffect(() => {
        // Run immediately on mount
        heartbeat().catch(console.error);

        // Then run every 15 seconds
        const intervalId = setInterval(() => {
            heartbeat().catch(console.error);
        }, 15000);

        return () => clearInterval(intervalId);
    }, [heartbeat]);

    return null;
}
