export function formatTime(date: string | Date): string {
    const now = new Date();
    const created = new Date(date);
    const diff = (now.getTime() - created.getTime()) / 1000;

    if (diff < 60) return "now";

    const minutes = Math.floor(diff / 60);
    if (minutes < 60) return `${minutes}min `;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}hr `;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d `;

    const weeks = Math.floor(days / 7);
    if (weeks < 50) return `${weeks}w `;

    const years = Math.floor(weeks / 50);
    return `${years}y `;
}
