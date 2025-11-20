// src/app/dashboard/layout.tsx
"use client";

import { useState, createContext, useContext } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

type DashboardTab = "overview" | "entries" | "add" | "export";

interface DashboardContextType {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardLayout");
  }
  return context;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  return (
    <DashboardContext.Provider value={{ activeTab, setActiveTab }}>
      <div
        className={`${inter.className} flex min-h-screen bg-[#f5f7ff] overflow-hidden`}
      >
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {/* Top Navigation Bar */}
          <Topbar />

          {/* Page Content */}
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
