"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error: string | null;
};

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "An account with this email already exists. Try logging in." };
    }
    return { error: error.message };
  }

  // Supabase sends a confirmation email by default.
  // Redirect to a holding page or show a success message.
  redirect("/auth/verify");
}
