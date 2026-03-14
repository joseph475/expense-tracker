import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "./components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    await supabase.auth.signOut(); // clears the stale cookie so middleware stops looping
    redirect("/auth");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar email={session.user.email!} />

      {/* Main content — offset for sidebar on desktop */}
      <main className="flex-1 md:ml-64 pb-24 md:pb-0">
        <div className="max-w-4xl mx-auto px-3 py-4">{children}</div>
      </main>
    </div>
  );
}
