// src/components/layout/Topbar.tsx
"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import { getAllPatients } from "@/lib/patientData";

export default function Topbar() {
  const patients = getAllPatients();

  return (
    <div className="sticky top-0 z-20 bg-white/70 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
          {/* Search */}
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <SearchBar patients={patients} />
          </div>
        </div>
      </div>
    </div>
  );
}
