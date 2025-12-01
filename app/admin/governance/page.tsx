"use client";

import { useState } from "react";
import { TrashIcon, ArrowPathIcon, PencilSquareIcon, ArchiveBoxXMarkIcon } from "@heroicons/react/24/outline";

export default function DataGovernance() {
  const [activeTab, setActiveTab] = useState("deleted");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Data Governance</h2>
        <p className="text-sm text-slate-500">Manage deletions, correct erroneously entered data, and restore records.</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("deleted")}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === "deleted" 
              ? "border-red-500 text-red-600" 
              : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <ArchiveBoxXMarkIcon className="w-4 h-4" />
            Deleted Records Bin
          </button>
          <button
            onClick={() => setActiveTab("correction")}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === "correction" 
              ? "border-green-500 text-green-600" 
              : "border-transparent text-slate-500 hover:text-slate-700"
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
          <div className="bg-red-50 border border-red-100 text-red-800 p-4 rounded-lg text-sm flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-full text-red-600 shadow-sm">
              <TrashIcon className="w-5 h-5" />
            </div>
            <div>
              <strong>Warning:</strong> "Force Delete" is a permanent action and cannot be undone. Use "Restore" to move records back to the active index.
            </div>
          </div>
          
          <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Individual Name</th>
                  <th className="p-4">Deleted By</th>
                  <th className="p-4">Deleted On</th>
                  <th className="p-4">Reason (Optional)</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="p-4 text-slate-900 font-medium">Test Individual A</td>
                  <td className="p-4 text-slate-600">Dr. Rajesh</td>
                  <td className="p-4 text-slate-500">Today, 10:00 AM</td>
                  <td className="p-4 text-slate-500 italic">Duplicate entry</td>
                  <td className="p-4 flex gap-2">
                    <button className="flex items-center gap-1 text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded transition-colors text-xs font-medium">
                      <ArrowPathIcon className="w-3.5 h-3.5" /> Restore
                    </button>
                    <button className="flex items-center gap-1 text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded transition-colors text-xs font-medium shadow-sm">
                      <TrashIcon className="w-3.5 h-3.5" /> Force Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content: Corrections */}
      {activeTab === "correction" && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center space-y-6">
          <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Edit Master Record</h3>
            <p className="text-sm text-slate-500">
              Admin privileges allow you to override specific data points in an individual's record without changing the audit trail of the original assessment.
            </p>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter Individual ID (e.g., P-1029)..." 
                className="flex-1 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              />
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium transition shadow-sm">
                Fetch Record
              </button>
            </div>
          </div>
          
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-slate-400">
            <PencilSquareIcon className="w-16 h-16 mb-4 text-slate-300" />
            <p className="font-medium">No record loaded.</p>
            <p className="text-sm">Enter an Individual ID above to enable admin-level corrections.</p>
          </div>
        </div>
      )}
    </div>
  );
}

