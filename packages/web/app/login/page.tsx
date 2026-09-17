import Link from "next/link";
import { LanguageSwitcher } from "@/app/components/LanguageSwitcher";
import { LoginForm } from "@/app/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#f4f6f8] font-sans text-zinc-900">
      <header className="border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/login"
            className="truncate text-lg font-semibold tracking-tight text-zinc-900"
          >
            Smart Pantry
          </Link>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <LoginForm />
      </main>
    </div>
  );
}
