// src/components/layout/Sidebar.tsx
"use client";

import {
  HomeIcon,
  DocumentTextIcon,
  PlusCircleIcon,
  ArrowDownTrayIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
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
    { label: "Analytics", icon: ChartBarIcon, tab: "analytics" },
    { label: "Reports", icon: DocumentArrowDownIcon, tab: "reports" },
    { label: "Export Data", icon: ArrowDownTrayIcon, tab: "export" },
  ];

  return (
    <aside className="w-64 h-screen bg-gray-900 border-r border-gray-800 hidden lg:flex flex-col shadow-xl overflow-y-auto">
      {/* Logo */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-teal-900 flex items-center justify-center text-white font-bold text-lg shadow-lg border border-teal-800">
            PH
          </div>
          <div>
            <div className="font-bold text-white">Data Collection</div>
            <div className="text-xs text-gray-300">Dashboard</div>
          </div>
        </div>

        {/* Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab as typeof activeTab)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[15px] font-bold transition-all ${
                activeTab === item.tab
                  ? "bg-teal-900 text-white shadow-lg border border-teal-800"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
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
