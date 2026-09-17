import { create } from "zustand";
import { persist } from "zustand/middleware";

export const PANTRY_STORAGE_KEY = "smart-pantry-storage";

export interface PantryItem {
  id: string;
  name: string;
}

interface PantryState {
  items: PantryItem[];
  addItem: (name: string) => void;
  clearItems: () => void;
}

interface PersistedPantryState {
  items: PantryItem[];
}

export const usePantryStore = create<PantryState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (name) => {
        const trimmedName = name.trim();
        if (!trimmedName) {
          return;
        }

        set((state) => ({
          items: [
            ...state.items,
            {
              id: crypto.randomUUID(),
              name: trimmedName,
            },
          ],
        }));
      },
      clearItems: () => set({ items: [] }),
    }),
    {
      name: PANTRY_STORAGE_KEY,
      partialize: (state): PersistedPantryState => ({ items: state.items }),
    },
  ),
);
