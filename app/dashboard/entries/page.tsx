// src/app/dashboard/entries/EntriesPage.tsx
"use client";

import { useState, useEffect } from "react";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";
import GlassCard from "@/components/ui/GlassCard";

interface EntriesPageProps {
  onNewEntry?: () => void;
  onEdit?: (id: string, data: any) => void;
  onView?: (data: any) => void;
}

interface PatientEntry {
  id: string;
  name: string;
  age: string;
  date: string;
  status: string;
  fullData?: any;
}

export default function EntriesPage({ onNewEntry, onEdit, onView }: EntriesPageProps) {
  const [entries, setEntries] = useState<PatientEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "physioAssessments"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const loadedEntries: PatientEntry[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const regDetails = data.registrationDetails || {};
        
        // Get full name - try multiple fields
        let fullName = regDetails.fullName || "";
        if (!fullName) {
          const parts = [
            regDetails.firstName,
            regDetails.initials,
            regDetails.lastName
          ].filter(Boolean);
          fullName = parts.join(" ").trim() || "Unknown Patient";
        }
        
        const age = regDetails.age || regDetails.yearsInService || "N/A";
        
        // Format date
        let date = regDetails.dateOfAssessment || "";
        if (!date && data.createdAt) {
          const timestamp = data.createdAt.toDate ? data.createdAt.toDate() : null;
          if (timestamp) {
            date = timestamp.toLocaleDateString();
          }
        }
        if (!date) date = "N/A";
        
        const status = data.status === "completed" ? "Completed" : data.status === "in_progress" ? "In Progress" : "Incomplete";
        
        loadedEntries.push({
          id: docSnapshot.id,
          name: fullName,
          age: String(age),
          date: date,
          status: status,
          fullData: { id: docSnapshot.id, ...data },
        });
      });
      
      setEntries(loadedEntries);
    } catch (error) {
      console.error("Error loading entries:", error);
      alert("Error loading entries. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    
    try {
      await deleteDoc(doc(db, "physioAssessments", id));
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Error deleting entry. Please try again.");
    }
  };

  const handleEdit = (id: string, data: any) => {
    if (onEdit) {
      onEdit(id, data);
    }
  };

  const handleView = (data: any) => {
    if (onView) {
      onView(data);
    } else {
      // Fallback: show data in alert or console
      console.log("View entry:", data);
      alert("View functionality - Entry data logged to console");
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold text-white">All Entries</h2>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={loadEntries}
            className="px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-lg font-bold hover:bg-white/20 transition-all shadow-lg border border-white/30 whitespace-nowrap"
            title="Refresh entries"
          >
            ↻ Refresh
          </button>
          <button
            onClick={onNewEntry}
            className="px-4 py-2 bg-[#1a4d4d]/80 backdrop-blur-sm text-white rounded-lg font-bold hover:bg-[#1a4d4d]/90 transition-all shadow-lg border border-[#1a4d4d]/50 whitespace-nowrap"
          >
            + New Entry
          </button>
        </div>
      </div>

      {/* Table */}
      <GlassCard>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="text-xs text-white/70 font-bold text-left border-b border-white/20">
              <tr>
                <th className="py-3">ID</th>
                <th className="py-3">Name</th>
                <th className="py-3">Age</th>
                <th className="py-3">Assessment Date</th>
                <th className="py-3">Overall Status</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/20">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-white/70">
                    Loading entries...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-white/70">
                    No entries found. Create a new entry to get started.
                  </td>
                </tr>
              ) : (
                entries.map((row) => (
                <tr key={row.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 text-white font-medium">P-{row.id.slice(0, 6)}</td>

                  <td className="py-4 text-white flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#1a4d4d]/80 backdrop-blur-sm text-white rounded-full flex items-center justify-center font-bold border border-[#1a4d4d]/50">
                      {row.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>

                    <div>
                      <div className="font-bold text-white">{row.name}</div>
                    </div>
                  </td>

                  <td className="py-4 text-white">{row.age}</td>
                  <td className="py-4 text-white">{row.date}</td>

                  <td className="py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm border ${
                        row.status === "Completed"
                          ? "bg-green-500/80 text-white border-green-500/50"
                          : row.status === "In Progress"
                          ? "bg-yellow-500/80 text-white border-yellow-500/50"
                          : "bg-red-500/80 text-white border-red-500/50"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>

                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <button
                        title="View"
                        onClick={() => handleView(row.fullData)}
                        className="p-2 rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>

                      <button
                        title="Edit"
                        onClick={() => handleEdit(row.id, row.fullData)}
                        className="p-2 rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>

                      <button
                        title="Delete"
                        onClick={() => handleDelete(row.id)}
                        className="p-2 rounded-md text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
