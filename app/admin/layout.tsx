"use client";

import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Topbar from "@/components/layout/Topbar";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div
      className={`${inter.className} flex min-h-screen relative bg-gray-900`}
      style={{
        backgroundImage: "url('/final ui.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

      {/* Sidebar - Fixed */}
      <div className="fixed left-0 top-0 h-screen z-10">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 relative z-10">
        {/* Top Navigation Bar - Same as Dashboard */}
        <Topbar />

        {/* Page Content - Scrollable */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
