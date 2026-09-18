"use client";

import { Button, Card, Input } from "@smart-pantry/ui";
import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { signIn, signUp, type AuthActionResult } from "@/app/actions/auth";
import { isNextRedirectError } from "@/lib/auth/redirect";
import { useTranslation } from "@/i18n/useTranslation";
import type { MessageKey } from "@/i18n/messages";

type AuthMode = "signIn" | "signUp";

export interface LoginFormProps {
  initialMode?: AuthMode;
}

const AUTH_ERROR_KEYS = new Set<MessageKey>([
  "auth.error.invalidEmail",
  "auth.error.passwordTooShort",
  "auth.error.nameRequired",
  "auth.error.nameTooShort",
]);

function resolveAuthMessage(
  t: (key: MessageKey) => string,
  value: string,
): string {
  if (AUTH_ERROR_KEYS.has(value as MessageKey)) {
    return t(value as MessageKey);
  }

  return value;
}

export function LoginForm({ initialMode = "signIn" }: LoginFormProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        const action = mode === "signIn" ? signIn : signUp;
        const result: AuthActionResult = await action(formData);

        if (!result.ok) {
          setError(resolveAuthMessage(t, result.error));
          return;
        }

        if (result.needsEmailConfirmation) {
          setInfo(t("auth.confirmEmail"));
          setMode("signIn");
        }
      } catch (caught) {
        if (isNextRedirectError(caught)) {
          throw caught;
        }

        setError(t("auth.error.unexpected"));
      }
    });
  };

  return (
    <Card className="w-full max-w-md" padding="lg">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          {mode === "signIn" ? t("auth.signInHeading") : t("auth.signUpHeading")}
        </h1>
        <p className="text-sm text-zinc-600">
          {mode === "signIn" ? t("auth.signInSubtitle") : t("auth.signUpSubtitle")}
        </p>
      </div>

      <div
        className="mb-6 inline-flex w-full rounded-lg border border-zinc-200 bg-zinc-50 p-1"
        role="group"
        aria-label={t("auth.modeGroupAria")}
      >
        <Button
          type="button"
          size="sm"
          className="flex-1"
          variant={mode === "signIn" ? "primary" : "ghost"}
          aria-pressed={mode === "signIn"}
          disabled={isPending}
          onClick={() => {
            setMode("signIn");
            setError(null);
            setInfo(null);
          }}
        >
          {t("auth.signIn")}
        </Button>
        <Button
          type="button"
          size="sm"
          className="flex-1"
          variant={mode === "signUp" ? "primary" : "ghost"}
          aria-pressed={mode === "signUp"}
          disabled={isPending}
          onClick={() => {
            setMode("signUp");
            setError(null);
            setInfo(null);
          }}
        >
          {t("auth.signUp")}
        </Button>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        {mode === "signUp" ? (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="auth-name"
              className="text-sm font-medium text-zinc-700"
            >
              {t("auth.name")}
            </label>
            <Input
              id="auth-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
              value={fullName}
              disabled={isPending}
              onChange={(event) => setFullName(event.target.value)}
              placeholder={t("auth.namePlaceholder")}
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="auth-email" className="text-sm font-medium text-zinc-700">
            {t("auth.email")}
          </label>
          <Input
            id="auth-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            disabled={isPending}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t("auth.emailPlaceholder")}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="auth-password"
            className="text-sm font-medium text-zinc-700"
          >
            {t("auth.password")}
          </label>
          <Input
            id="auth-password"
            name="password"
            type="password"
            autoComplete={mode === "signIn" ? "current-password" : "new-password"}
            required
            minLength={6}
            value={password}
            disabled={isPending}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t("auth.passwordPlaceholder")}
          />
        </div>

        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}

        {info ? (
          <p role="status" className="text-sm text-emerald-700">
            {info}
          </p>
        ) : null}

        <Button type="submit" className="w-full" isLoading={isPending}>
          {mode === "signIn" ? t("auth.signInSubmit") : t("auth.signUpSubmit")}
        </Button>

        <p className="text-center text-sm text-zinc-600">
          <Link
            href="/"
            className="font-medium text-zinc-900 underline-offset-2 hover:underline"
          >
            {t("guest.continueExploring")}
          </Link>
        </p>
      </form>
    </Card>
  );
}
