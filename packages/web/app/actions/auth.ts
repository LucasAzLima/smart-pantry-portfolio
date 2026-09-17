"use server";

import { redirect } from "next/navigation";
import { validateAuthCredentials } from "@/lib/auth/credentials";
import { createClient } from "@/lib/supabase/server";

export type AuthActionResult =
  | { ok: true; needsEmailConfirmation?: boolean }
  | { ok: false; error: string };

function readField(formData: FormData, key: string): unknown {
  return formData.get(key);
}

export async function signIn(formData: FormData): Promise<AuthActionResult> {
  const validation = validateAuthCredentials(
    readField(formData, "email"),
    readField(formData, "password"),
  );

  if (!validation.ok) {
    return { ok: false, error: validation.errorKey };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(
    validation.credentials,
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  redirect("/");
}

export async function signUp(formData: FormData): Promise<AuthActionResult> {
  const validation = validateAuthCredentials(
    readField(formData, "email"),
    readField(formData, "password"),
  );

  if (!validation.ok) {
    return { ok: false, error: validation.errorKey };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(validation.credentials);

  if (error) {
    return { ok: false, error: error.message };
  }

  const needsEmailConfirmation = !data.session;

  if (needsEmailConfirmation) {
    return { ok: true, needsEmailConfirmation: true };
  }

  redirect("/");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
