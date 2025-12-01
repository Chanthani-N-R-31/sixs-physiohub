"use client";

import { useState } from "react";
import { TrashIcon, ArrowPathIcon, PencilSquareIcon, ArchiveBoxXMarkIcon } from "@heroicons/react/24/outline";
import GlassCard from "@/components/ui/GlassCard";

export default function DataGovernance() {
  const [activeTab, setActiveTab] = useState("deleted");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Data Governance</h2>
        <p className="text-white/70 mt-1 font-medium">Manage deletions, correct erroneously entered data, and restore records.</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-white/30">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("deleted")}
            className={`py-4 px-2 border-b-2 font-bold text-sm transition-colors flex items-center gap-2 ${
              activeTab === "deleted" 
              ? "border-red-500 text-white" 
              : "border-transparent text-white/70 hover:text-white"
            }`}
          >
            <ArchiveBoxXMarkIcon className="w-4 h-4" />
            Deleted Records Bin
          </button>
          <button
            onClick={() => setActiveTab("correction")}
            className={`py-4 px-2 border-b-2 font-bold text-sm transition-colors flex items-center gap-2 ${
              activeTab === "correction" 
              ? "border-green-500 text-white" 
              : "border-transparent text-white/70 hover:text-white"
            }`}
          >
            <PencilSquareIcon className="w-4 h-4" />
            Correction Console
          </button>
        </div>
      </div>

      {/* Content: Deleted Records */}
      {activeTab === "deleted" && (
        <div className="space-y-4">
          <GlassCard className="bg-red-500/20 border-red-500/50">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1.5 rounded-full text-red-300 shadow-sm backdrop-blur-sm">
                <TrashIcon className="w-5 h-5" />
              </div>
              <div className="text-white font-bold text-sm">
                <strong>Warning:</strong> "Force Delete" is a permanent action and cannot be undone. Use "Restore" to move records back to the active index.
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white/10 backdrop-blur-sm border-b border-white/20">
                  <tr>
                    <th className="p-4 text-white/70 font-bold">Individual Name</th>
                    <th className="p-4 text-white/70 font-bold">Deleted By</th>
                    <th className="p-4 text-white/70 font-bold">Deleted On</th>
                    <th className="p-4 text-white/70 font-bold">Reason (Optional)</th>
                    <th className="p-4 text-white/70 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-white font-bold">Test Individual A</td>
                    <td className="p-4 text-white/80">Dr. Rajesh</td>
                    <td className="p-4 text-white/70">Today, 10:00 AM</td>
                    <td className="p-4 text-white/60 italic">Duplicate entry</td>
                    <td className="p-4 flex gap-2">
                      <button className="flex items-center gap-1 text-white bg-green-500/80 hover:bg-green-500/90 border border-green-500/50 backdrop-blur-sm px-3 py-1.5 rounded transition-colors text-xs font-bold">
                        <ArrowPathIcon className="w-3.5 h-3.5" /> Restore
                      </button>
                      <button className="flex items-center gap-1 text-white bg-red-600/80 hover:bg-red-600/90 backdrop-blur-sm px-3 py-1.5 rounded transition-colors text-xs font-bold shadow-sm border border-red-600/50">
                        <TrashIcon className="w-3.5 h-3.5" /> Force Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Content: Corrections */}
      {activeTab === "correction" && (
        <GlassCard className="text-center space-y-6">
          <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-lg font-bold text-white">Edit Master Record</h3>
            <p className="text-sm text-white/70 font-medium">
              Admin privileges allow you to override specific data points in an individual's record without changing the audit trail of the original assessment.
            </p>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter Individual ID (e.g., P-1029)..." 
                className="flex-1 p-3 bg-white/20 backdrop-blur-md border border-white/40 rounded-lg text-white font-bold placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 shadow-lg"
              />
              <button className="bg-[#1a4d4d]/80 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-[#1a4d4d]/90 font-bold transition shadow-lg border border-[#1a4d4d]/50">
                Fetch Record
              </button>
            </div>
          </div>
          
          <div className="border-2 border-dashed border-white/30 rounded-xl p-12 flex flex-col items-center justify-center text-white/60">
            <PencilSquareIcon className="w-16 h-16 mb-4 text-white/40" />
            <p className="font-bold">No record loaded.</p>
            <p className="text-sm">Enter an Individual ID above to enable admin-level corrections.</p>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
