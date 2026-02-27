import { format, isToday, isThisYear } from "date-fns";

export function formatTimestamp(timestamp: number) {
    const date = new Date(timestamp);

    if (isToday(date)) {
        return format(date, "HH:mm");
    }

    if (isThisYear(date)) {
        return format(date, "MMM d, HH:mm");
    }

    return format(date, "MMM d, yyyy HH:mm");
}

export function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}
