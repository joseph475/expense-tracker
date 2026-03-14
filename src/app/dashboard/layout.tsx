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
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar email={user.email!} />

      {/* Main content — offset for sidebar on desktop */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-8">{children}</div>
      </main>
    </div>
  );
}
