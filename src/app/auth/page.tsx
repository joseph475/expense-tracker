import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AuthForm from "./components/AuthForm";

export const metadata = { title: "Sign In — Money Tracker" };

export default async function AuthPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Valid session → skip login screen
  if (session) redirect("/dashboard");

  return <AuthForm />;
}
