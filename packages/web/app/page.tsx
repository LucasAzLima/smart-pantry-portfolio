import { PantryDemo } from "./components/PantryDemo";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <main className="flex w-full max-w-lg flex-col gap-8 rounded-2xl bg-white p-8 shadow-sm dark:bg-zinc-950">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Smart Pantry
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400">
            Foundation demo: shared UI button plus Zustand store.
          </p>
        </header>
        <PantryDemo />
      </main>
    </div>
  );
}
