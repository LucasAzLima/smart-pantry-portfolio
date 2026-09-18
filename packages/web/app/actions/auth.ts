"use server";

import { redirect } from "next/navigation";
import {
  validateAuthCredentials,
  validateFullName,
} from "@/lib/auth/credentials";
import { createAdminClient } from "@/lib/supabase/admin";
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
  const nameValidation = validateFullName(readField(formData, "name"));

  if (!nameValidation.ok) {
    return { ok: false, error: nameValidation.errorKey };
  }

  const validation = validateAuthCredentials(
    readField(formData, "email"),
    readField(formData, "password"),
  );

  if (!validation.ok) {
    return { ok: false, error: validation.errorKey };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...validation.credentials,
    options: {
      data: {
        full_name: nameValidation.fullName,
      },
    },
  });

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

/**
 * Deletes the authenticated user's Auth account (pantry rows cascade via FK).
 * Uses the service-role admin API, then clears the session.
 */
export async function deleteAccount(): Promise<AuthActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, error: "auth.error.notAuthenticated" };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (caught) {
    const message =
      caught instanceof Error ? caught.message : "Unknown admin client error";
    console.error("[deleteAccount]", message);
    return { ok: false, error: "auth.error.deleteUnavailable" };
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    return { ok: false, error: deleteError.message };
  }

  await supabase.auth.signOut();
  redirect("/login");
}
