import { create } from 'zustand';

type AvatarStore = {
    avatarUrl: string | null;
    setAvatarUrl: (url: string) => void;
};

export const useAvatarStore = create<AvatarStore>((set) => ({
    avatarUrl: null,
    setAvatarUrl: (url) => set({ avatarUrl: url }),
}));
