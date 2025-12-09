export function formatPostDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();

    if (isNaN(date.getTime())) return ""; // failsafe

    const diffInMs = now.getTime() - date.getTime();
    const oneYearMs = 1000 * 60 * 60 * 24 * 365;

    const isOlderThanOneYear = diffInMs > oneYearMs;

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear().toString().slice(2); // "25"

    return isOlderThanOneYear
        ? `${day} ${month} ${year}`
        : `${day} ${month}`;
}
