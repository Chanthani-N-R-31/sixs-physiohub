"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import StatsCard from "@/components/StatsCard";
import RecentEntries from "@/components/RecentEntries";
import { auth } from "@/lib/firebase";
import { User, signOut } from "firebase/auth";

import {
  UserCircleIcon,
  HeartIcon,
  BeakerIcon,
  AcademicCapIcon,
  FireIcon,
} from "@heroicons/react/24/solid";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Auth check (protected)
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsub();
  }, [router]);

  // Stats + mapping to form routes
  const stats = [
    {
      title: "Physiotherapy",
      value: 124,
      delta: "+8%",
      icon: <BeakerIcon className="w-6 h-6 text-blue-500" />,
      href: "/physiotherapy/form",
    },
    {
      title: "Physiology",
      value: 87,
      delta: "+2%",
      icon: <HeartIcon className="w-6 h-6 text-red-500" />,
      href: "/physiology/form", // placeholder route (you'll provide template later)
    },
    {
      title: "Biomechanics",
      value: 45,
      delta: "-1%",
      icon: <FireIcon className="w-6 h-6 text-orange-500" />,
      href: "/biomechanics/form",
    },
    {
      title: "Nutrition",
      value: 62,
      delta: "+4%",
      icon: <AcademicCapIcon className="w-6 h-6 text-green-500" />,
      href: "/nutrition/form",
    },
    {
      title: "Psychology",
      value: 33,
      delta: "+6%",
      icon: <UserCircleIcon className="w-6 h-6 text-indigo-500" />,
      href: "/psychology/form",
    },
  ];

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed. Try again.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <main className="flex-1 p-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
            <p className="text-sm text-gray-500">
              Welcome back{user ? `, ${user.email}` : ""}! 👋
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Removed Settings as requested */}
            <button
              onClick={() => router.push("/export")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
            >
              Export Data
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm shadow-sm hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Stats (clickable) */}
        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {stats.map((stat) => (
            <div
              key={stat.title}
              onClick={() => router.push(stat.href)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && router.push(stat.href)}
              className="cursor-pointer transform hover:-translate-y-0.5 transition p-0"
            >
              <StatsCard
                title={stat.title}
                value={stat.value}
                delta={stat.delta}
                icon={stat.icon}
              />
            </div>
          ))}
        </section>

        {/* Bottom Sections */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RecentEntries />
          </div>

          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Actions</h3>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => router.push("/physiotherapy/form")}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 border border-gray-100"
                >
                  ➕ New Entry (Physiotherapy)
                </button>
                <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 border border-gray-100">
                  📥 Import CSV
                </button>
                <button className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 border border-gray-100">
                  ⚙ Manage Templates
                </button>
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Announcements</h3>
              <p className="text-xs text-gray-500">
                No announcements right now. Check back later.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
