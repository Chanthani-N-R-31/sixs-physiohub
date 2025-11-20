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
      href: "/physiology/form",
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
      <Sidebar />

      <main className="flex-1 p-6">
        {/* HEADER */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
            <p className="text-sm text-gray-500">
              Welcome back{user ? `, ${user.email}` : ""}! 👋
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm shadow-sm hover:bg-gray-100 text-gray-900 font-medium"
          >
            Logout
          </button>
        </header>

        {/* STATS GRID */}
        <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {stats.map((stat) => (
            <div
              key={stat.title}
              onClick={() => router.push(stat.href)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && router.push(stat.href)}
              className="cursor-pointer transform hover:-translate-y-0.5 transition"
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

        {/* RECENT ENTRIES ONLY */}
        <section>
          <RecentEntries />
        </section>
      </main>
    </div>
  );
}
