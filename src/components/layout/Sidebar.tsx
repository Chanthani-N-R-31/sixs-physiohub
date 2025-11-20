// src/components/layout/Sidebar.tsx
"use client";

import {
  HomeIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/app/dashboard/layout";

export default function Sidebar() {
  const router = useRouter();
  const { activeTab, setActiveTab } = useDashboard();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const menuItems = [
    { label: "Overview", icon: HomeIcon, tab: "overview" },
    { label: "Entries", icon: DocumentTextIcon, tab: "entries" },
    { label: "Add New Entry", icon: PlusCircleIcon, tab: "add" },
    { label: "Export Data", icon: ArrowDownTrayIcon, tab: "export" },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-100 hidden lg:flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-green-600 flex items-center justify-center text-white font-semibold text-lg">
            PH
          </div>
          <div>
            <div className="font-semibold text-gray-900">PH PhysioHub</div>
            <div className="text-xs text-gray-500">Clinical Dashboard</div>
          </div>
        </div>

        {/* Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab as typeof activeTab)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[15px] transition-all ${
                activeTab === item.tab
                  ? "bg-green-50 text-green-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom items */}
      <div className="mt-auto px-6 py-6 border-t border-gray-100">
        {/* User Avatar */}
        <div className="mb-4 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-semibold">
            N
          </div>
        </div>

        <button
          onClick={() => alert("Settings page coming soon")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <Cog6ToothIcon className="w-5 h-5" />
          Settings
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
