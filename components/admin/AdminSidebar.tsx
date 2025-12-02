"use client";

import {
  HomeIcon,
  UsersIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const menuItems = [
    {
      label: "Overview",
      icon: HomeIcon,
      href: "/admin",
    },
    {
      label: "Users",
      icon: UsersIcon,
      href: "/admin/users",
    },
    {
      label: "Patients",
      icon: UserGroupIcon,
      href: "/admin/patients",
    },
    {
      label: "Governance",
      icon: ShieldCheckIcon,
      href: "/admin/governance",
    },
    {
      label: "Activity",
      icon: ClockIcon,
      href: "/admin/activity",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside className="w-64 min-h-screen bg-gray-900 border-r border-gray-800 hidden lg:flex flex-col shadow-xl">
      {/* Logo */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-teal-900 flex items-center justify-center text-white font-bold text-lg shadow-lg border border-teal-800">
            PH
          </div>
          <div>
            <div className="font-bold text-white">Data Collection</div>
            <div className="text-xs text-gray-300">Admin Dashboard</div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <Link
          href="/dashboard"
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 hover:text-white font-bold transition-all mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[15px] font-bold transition-all ${
                  active
                    ? "bg-teal-900 text-white shadow-lg border border-teal-800"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom items */}
      <div className="mt-auto px-6 py-6 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-white/80 hover:text-white font-bold transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
