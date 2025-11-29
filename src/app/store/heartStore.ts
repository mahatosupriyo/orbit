// src/app/store/heartStore.ts
import { create } from "zustand";

type SoundEntry = {
    audio: HTMLAudioElement;
    url: string;
    loaded: boolean;
};

type HeartStore = {
    sounds: Record<string, SoundEntry | undefined>;
    load: (key: string, url: string, preload?: "none" | "metadata" | "auto") => Promise<void>;
    play: (key: string, url?: string) => Promise<void>;
    stop: (key: string) => void;
    setVolume: (key: string, volume: number) => void;
    isLoaded: (key: string) => boolean;
};

const useHeartStore = create<HeartStore>((set, get) => ({
    sounds: {},

    load: async (key, url, preload = "none") => {
        if (typeof window === "undefined") return;

        const existing = get().sounds[key];
        if (existing && existing.url === url) return;

        if (existing) {
            try {
                existing.audio.pause();
            } catch { }
        }

        const audio = new Audio(url);
        audio.preload = preload;
        audio.autoplay = false;
        audio.volume = 0.8;

        // optimistic set (entry available immediately)
        set((s) => ({ sounds: { ...s.sounds, [key]: { audio, url, loaded: false } } }));

        // wait for canplaythrough or timeout, then mark as loaded (non-blocking)
        await new Promise<void>((resolve) => {
            let resolved = false;
            const onReady = () => {
                if (resolved) return;
                resolved = true;
                audio.removeEventListener("canplaythrough", onReady);
                audio.removeEventListener("error", onErr);
                resolve();
            };
            const onErr = () => {
                if (resolved) return;
                resolved = true;
                audio.removeEventListener("canplaythrough", onReady);
                audio.removeEventListener("error", onErr);
                resolve();
            };
            audio.addEventListener("canplaythrough", onReady);
            audio.addEventListener("error", onErr);
            // safety timeout (5s)
            setTimeout(onReady, 5000);
        });

        set((s) => ({ sounds: { ...s.sounds, [key]: { audio, url, loaded: true } } }));
    },

    play: async (key, url) => {
        if (typeof window === "undefined") return;

        let entry = get().sounds[key];

        if (!entry) {
            if (!url) return;
            // lazy-load with preload none (no automatic fetch until we explicitly load)
            await get().load(key, url, "none");
            entry = get().sounds[key];
            if (!entry) return;
        } else if (url && entry.url !== url) {
            // different url -> reload that key
            await get().load(key, url, "none");
            entry = get().sounds[key];
            if (!entry) return;
        }

        try {
            entry.audio.currentTime = 0;
            // ONLY call load() if we haven't marked it loaded yet.
            // calling load() repeatedly can trigger network validation/fetches.
            if (!entry.loaded) {
                try { entry.audio.load(); } catch { }
            }
            await entry.audio.play();
        } catch (e) {
            // ignore playback/autoplay errors
        }
    },


    stop: (key) => {
        const entry = get().sounds[key];
        if (!entry) return;
        try {
            entry.audio.pause();
            entry.audio.currentTime = 0;
        } catch { }
    },

    setVolume: (key, volume) => {
        const entry = get().sounds[key];
        if (!entry) return;
        entry.audio.volume = Math.max(0, Math.min(1, volume));
    },

    isLoaded: (key) => {
        return Boolean(get().sounds[key]?.loaded);
    },
}));

export default useHeartStore;
