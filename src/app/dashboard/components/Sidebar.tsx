"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Wallet, PieChart, MoreHorizontal } from "lucide-react";

// Get today's date in M/D format
function getTodayLabel() {
  const today = new Date();
  const month = today.getMonth() + 1; // getMonth() returns 0-11
  const day = today.getDate();
  return `${month}/${day}`;
}

const links = [
  { href: "/dashboard",          label: getTodayLabel(), icon: BookOpen },
  { href: "/dashboard/accounts", label: "Accounts",      icon: Wallet },
  { href: "/dashboard/stats",    label: "Stats",         icon: PieChart },
  { href: "/dashboard/settings", label: "More",          icon: MoreHorizontal },
];

export default function Sidebar({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col bg-white border-r border-gray-200">
        <div className="px-6 py-5 border-b border-gray-100">
          <span className="text-lg font-bold text-indigo-600">💸 MoneyTracker</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100">
          <p className="px-3 text-xs text-gray-400 truncate">{email}</p>
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-10 bg-white border-t border-gray-200 flex pb-6 supports-[padding:max(0px)]:pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition ${
                active ? "text-indigo-600" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
