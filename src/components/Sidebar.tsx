"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const pathname = usePathname();

  const nav = [
    { label: "Overview", href: "/dashboard", icon: HomeIcon },
    { label: "Entries", href: "/dashboard/entries", icon: DocumentTextIcon },
    { label: "Users", href: "/dashboard/users", icon: UserGroupIcon },
    { label: "Add New Entry", href: "/entry", icon: PlusCircleIcon }, // ✅ ADDED HERE
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-200 min-h-screen hidden md:block">
      <div className="px-6 py-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
            PH
          </div>
          <div>
            <div className="font-bold text-gray-900">PhysioHub</div>
            <div className="text-xs text-gray-500">Data & Patients</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-8 space-y-1">
          {nav.map((n) => {
            const Active = pathname === n.href;
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  Active
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Export Button */}
        <div className="mt-8">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export Data
          </button>
        </div>
      </div>
    </aside>
  );
}
