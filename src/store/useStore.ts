import { create } from "zustand";
import { persist, StateStorage, createJSONStorage } from "zustand/middleware";
import { get, set as idbSet, del } from "idb-keyval";

const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await idbSet(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export type GenerationType = "logo" | "icon" | "infographic" | "tshirt";

export interface GenerationHistory {
  id: string;
  type: GenerationType;
  prompt: string;
  imageUrl: string;
  createdAt: number;
}

interface AppState {
  theme: "light" | "dark";
  toggleTheme: () => void;
  history: GenerationHistory[];
  addHistory: (item: Omit<GenerationHistory, "id" | "createdAt">) => void;
  clearHistory: () => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  groqApiKey: string;
  setGroqApiKey: (key: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "dark",
      toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
      history: [],
      addHistory: (item) =>
        set((state) => ({
          history: [
            {
              ...item,
              id: Math.random().toString(36).substring(2, 9),
              createdAt: Date.now(),
            },
            ...state.history,
          ],
        })),
      clearHistory: () => set({ history: [] }),
      geminiApiKey: "",
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
      groqApiKey: "",
      setGroqApiKey: (key) => set({ groqApiKey: key }),
    }),
    {
      name: "sweet-design-studio-storage",
      storage: createJSONStorage(() => storage),
    }
  )
);
