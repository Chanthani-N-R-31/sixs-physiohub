// src/components/layout/Topbar.tsx
"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  BellIcon,
  UserCircleIcon,
  FunnelIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function Topbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user?.email) setUserEmail(user.email);
    });
    return () => unsub();
  }, []);

  return (
    <div className="sticky top-0 z-20 bg-white/70 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
          {/* Search */}
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                placeholder="Search patient details..."
                className="w-full sm:w-96 md:w-[420px] p-2.5 pl-10 pr-4 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm hidden sm:block">
                ⌘K
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end">
            {/* Summarize Button */}
            <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium">
              <SparklesIcon className="w-4 h-4" />
              Summarize
            </button>

            {/* Notifications */}
            <button className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
              <BellIcon className="w-5 h-5" />
            </button>

            {/* Profile */}
            <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-full px-3 py-1 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                <UserCircleIcon className="w-6 h-6" />
              </div>

              <div className="text-sm hidden sm:block">
                <div className="font-medium text-gray-900">
                  {userEmail ?? "Doctor"}
                </div>
                <div className="text-xs text-gray-500">Physiotherapist</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
