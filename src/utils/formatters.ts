/**
 * Format a JavaScript Date object to a string in "DD Month YY" format
 * (e.g. "31 May 25")
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "2-digit",
  });
};

/**
 * Format a JavaScript Date object to a string in "HH.MM AM/PM" format
 * (e.g. "04.20 PM")
 */
export const formatTime = (date: Date): string => {
  return date
    .toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(":", ".");
};
