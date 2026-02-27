"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function UserSync() {
    const { user } = useUser();
    const storeUser = useMutation(api.users.storeUser);

    useEffect(() => {
        if (!user) return;

        // save user to convex
        storeUser({
            name: user.fullName || user.firstName || "Anonymous",
            email: user.emailAddresses[0].emailAddress,
            image: user.imageUrl,
            clerkId: user.id,
        });
    }, [user, storeUser]);

    return null;
}
