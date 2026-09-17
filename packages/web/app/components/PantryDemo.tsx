"use client";

import { Button } from "@smart-pantry/ui";
import { useState } from "react";
import { usePantryStore } from "@/store/usePantryStore";

export function PantryDemo() {
  const [name, setName] = useState("");
  const items = usePantryStore((state) => state.items);
  const addItem = usePantryStore((state) => state.addItem);
  const clearItems = usePantryStore((state) => state.clearItems);

  const handleAdd = () => {
    addItem({ name });
    setName("");
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="item-name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Item name
        </label>
        <input
          id="item-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleAdd();
            }
          }}
          placeholder="e.g. Olive oil"
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-900 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      <div className="flex gap-3">
        <Button onClick={handleAdd}>Add item</Button>
        <Button variant="secondary" onClick={clearItems} disabled={items.length === 0}>
          Clear
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No items yet. Add something to your pantry.
        </p>
      ) : (
        <ul className="flex flex-col gap-2" aria-label="Pantry items">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700"
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
