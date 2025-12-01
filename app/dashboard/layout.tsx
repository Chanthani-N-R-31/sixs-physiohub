// src/app/dashboard/layout.tsx
"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if we're on an admin route - if so, skip dashboard layout (admin has its own)
  const isAdminRoute = mounted && pathname?.startsWith("/admin");

  // If on admin route, just render children (admin layout will handle its own UI)
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <DashboardContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`${inter.className} flex min-h-screen bg-gray-900 relative overflow-hidden`}>
        {/* Sidebar */}
        <div className="relative z-10">
          <Sidebar />
        </div>

        {/* Main Content with Background Image - Right Side Only */}
        <div 
          className="flex-1 flex flex-col min-h-screen overflow-hidden relative z-10"
          style={{
            backgroundImage: `url('/final ui.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          }}
        >
          {/* Overlay for better readability */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
          
          {/* Top Navigation Bar */}
          <div className="relative z-10">
            <Topbar />
          </div>

          {/* Page Content */}
          <main className="relative z-10 flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
