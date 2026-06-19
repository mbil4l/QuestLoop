import { create } from "zustand";

interface ProfileStore {
  displayName: string;
  occupation: string;
  emoji: string;
  city: string;
  region: string;
  countryCode: string;
  setProfile: (
    updates: Partial<
      Pick<
        ProfileStore,
        | "displayName"
        | "occupation"
        | "emoji"
        | "city"
        | "region"
        | "countryCode"
      >
    >
  ) => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  displayName: "",
  occupation: "",
  emoji: "",
  city: "",
  region: "",
  countryCode: "",
  setProfile: (updates) => set(updates),
}));
