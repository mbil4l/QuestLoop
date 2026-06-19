import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loadAccount } from "@/lib/account";
import { WORLD_COLORS } from "@/lib/config";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarColor: string;
}

const PALETTE = Array.from(new Set(Object.values(WORLD_COLORS)));

export function accountIdFor(email: string): string {
  return "u_" + email.toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

function colorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

interface AuthStore {
  user: AuthUser | null;
  /** Mock Google sign-in. Swap for supabase.auth.signInWithOAuth later. */
  signIn: (email: string, name?: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      signIn: async (email, name) => {
        const id = accountIdFor(email);
        const user: AuthUser = {
          id,
          email,
          name: name?.trim() || email.split("@")[0],
          avatarColor: colorFor(id),
        };
        set({ user });
        await loadAccount(id);
        return user;
      },
      signOut: async () => {
        set({ user: null });
        await loadAccount("guest");
      },
    }),
    { name: "questloop-auth", skipHydration: true }
  )
);
