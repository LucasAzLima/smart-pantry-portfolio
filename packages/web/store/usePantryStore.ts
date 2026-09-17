import { create } from "zustand";

export interface PantryItem {
  id: string;
  name: string;
}

interface PantryState {
  items: PantryItem[];
  addItem: (name: string) => void;
  clearItems: () => void;
}

export const usePantryStore = create<PantryState>((set) => ({
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
}));
