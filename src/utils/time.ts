export function formatTime(date: string | Date): string {
    const now = new Date();
    const created = new Date(date);
    const diff = (now.getTime() - created.getTime()) / 1000; // seconds

    if (diff < 60) return "Posted now";

    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `Posted ${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Posted ${hours} hr${hours === 1 ? "" : "s"} ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `Posted ${days} day${days === 1 ? "" : "s"} ago`;

    const weeks = Math.floor(days / 7);
    if (weeks < 50) return `Posted ${weeks} week${weeks === 1 ? "" : "s"} ago`;

    const years = Math.floor(weeks / 50);
    return `Posted ${years} year${years === 1 ? "" : "s"} ago`;
}
