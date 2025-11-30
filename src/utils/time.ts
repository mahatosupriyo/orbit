// utils/time.ts
// Human-friendly time formatter for Orb UI following specific rules:
// - < 1 minute -> "now"
// - >=1 minute & <1 hour -> "X minute(s) ago"
// - >=1 hour & <1 day -> "X hour(s) ago"
// - >=1 day & <1 month (30 days) -> "X day(s) ago"
// - >=1 month & <60 weeks -> "X week(s) ago"
// - >=60 weeks & <=2 years -> "X year(s) ago"
// - >2 years -> full localized date "DD Month YYYY"
export function formatTime(date: string | Date | undefined | null): string {
  if (!date) return "";

  const created = typeof date === "string" ? new Date(date) : date;
  if (!(created instanceof Date) || isNaN(created.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  if (diffMs < 0) return "now"; // future dates -> treat as now

  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const week = Math.floor(day / 7);
  const weeks60 = 60 * 7; // days threshold for 60 weeks (in days)
  const year = Math.floor(day / 365);

  // under 1 minute
  if (sec < 60) return "now";

  // minutes (>=1 minute and <1 hour)
  if (min < 60) {
    return min === 1 ? "1 minute ago" : `${min} minutes ago`;
  }

  // hours (>=1 hour and <1 day) -- practical addition
  if (hr < 24) {
    return hr === 1 ? "1 hour ago" : `${hr} hours ago`;
  }

  // days (>=1 day and < 1 month (30 days))
  if (day < 30) {
    return day === 1 ? "1 day ago" : `${day} days ago`;
  }

  // weeks (>=1 month and < 60 weeks)
  // convert days -> weeks, but only if total days < 60 weeks in days
  if (day < weeks60) {
    const w = Math.floor(day / 7);
    // if less than 1 week but >= 30 days (rare), show weeks as 1
    const weeksToShow = Math.max(1, w);
    return weeksToShow === 1 ? "1 week ago" : `${weeksToShow} weeks ago`;
  }

  // years (>= 60 weeks and <= 2 years)
  const years = Math.floor(day / 365);
  if (years > 0 && years <= 2) {
    return years === 1 ? "1 year ago" : `${years} years ago`;
  }

  // older than 2 years -> show full localized date
  return created.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
