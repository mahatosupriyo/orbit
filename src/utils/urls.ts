// utils/url.ts
export const urlRegex = /((https?:\/\/[^\s<>]+)|(www\.[^\s<>]+)|([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.[a-z]{2,}(?:\/[^\s<>]*)?))/ig;

export function prettyUrl(raw: string) {
    try {
        return raw.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
    } catch {
        return raw;
    }
}

export function makeHref(raw: string) {
    if (/^https?:\/\//i.test(raw)) return raw;
    if (/^www\./i.test(raw)) return `https://${raw}`;
    return `https://${raw}`;
}
