// src/app/dashboard/overview/OverviewPage.tsx
"use client";

import { useState, useEffect } from "react";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs, deleteDoc, doc } from "firebase/firestore";
import GlassCard from "@/components/ui/GlassCard";

interface Entry {
  id: string;
  fullId: string; // Full document ID for operations
  name: string;
  age: string;
  date: string;
  status: string;
  fullData?: any; // Full document data
}

interface OverviewPageProps {
  onEdit?: (id: string, data: any) => void;
  onView?: (data: any) => void;
}

export default function OverviewPage({ onEdit, onView }: OverviewPageProps = {}) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Define the 4 states you requested
  const [totalPatients] = useState(50); // Static 50, never changes
  const [completedCount, setCompletedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [assessmentsToday, setAssessmentsToday] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // --- A. Fetch Recent Entries for the Table (Limit 5) ---
      const recentQuery = query(
        collection(db, "physioAssessments"),
        orderBy("updatedAt", "desc"),
        limit(5)
      );
      const recentSnapshot = await getDocs(recentQuery);
      
      const loadedEntries: Entry[] = [];
      recentSnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const regDetails = data.registrationDetails || {};
        
        // Name Logic
        let fullName = regDetails.fullName || "";
        if (!fullName) {
          const parts = [regDetails.firstName, regDetails.initials, regDetails.lastName].filter(Boolean);
          fullName = parts.join(" ").trim() || "Unknown Patient";
        }
        
        // Date Logic
        let date = regDetails.dateOfAssessment || "";
        if (!date && data.createdAt) {
          const timestamp = data.createdAt.toDate ? data.createdAt.toDate() : null;
          if (timestamp) date = timestamp.toLocaleDateString();
        }
        
        // Status Logic
        const statusRaw = data.status || "incomplete";
        const statusLabel = statusRaw === "completed" ? "Completed" : statusRaw === "in_progress" ? "In Progress" : "Incomplete";
        
        loadedEntries.push({
          id: docSnapshot.id.slice(0, 6),
          fullId: docSnapshot.id, // Store full ID for operations
          name: fullName,
          age: String(regDetails.age || regDetails.yearsInService || "N/A"),
          date: date || "N/A",
          status: statusLabel,
          fullData: { id: docSnapshot.id, ...data }, // Store full data
        });
      });
      setEntries(loadedEntries);

      // --- B. Fetch ALL Entries to Calculate Stats ---
      const allQuery = query(collection(db, "physioAssessments"));
      const allSnapshot = await getDocs(allQuery);

      let tempCompleted = 0;
      let tempPending = 0;
      let tempToday = 0;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      allSnapshot.forEach((doc) => {
        const data = doc.data();
        
        // 1. Count Completed
        if (data.status === "completed") {
          tempCompleted++;
        } else {
          // 2. Count Pending (anything not completed)
          tempPending++;
        }

        // 3. Count Today
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : null;
        if (createdAt && createdAt >= today) {
          tempToday++;
        }
      });

      setCompletedCount(tempCompleted);
      setPendingCount(tempPending);
      setAssessmentsToday(tempToday);

    } catch (error) {
      console.error("Error loading overview data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (entry: Entry) => {
    if (onView && entry.fullData) {
      onView(entry.fullData);
    } else if (entry.fullData) {
      // Fallback: show data in alert or console
      const regDetails = entry.fullData.registrationDetails || {};
      const name = regDetails.fullName || entry.name;
      alert(`Viewing entry for: ${name}\n\nStatus: ${entry.fullData.status || "N/A"}\n\nCheck console for full data.`);
      console.log("Full entry data:", entry.fullData);
    }
  };

  const handleEdit = (entry: Entry) => {
    if (onEdit && entry.fullData) {
      onEdit(entry.fullId, entry.fullData);
    } else {
      console.log("Edit entry:", entry.fullId, entry.fullData);
      alert("Edit functionality - Entry data logged to console");
    }
  };

  const handleDelete = async (entry: Entry) => {
    if (!confirm(`Are you sure you want to delete the entry for ${entry.name}?`)) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, "physioAssessments", entry.fullId));
      // Remove from local state
      setEntries((prev) => prev.filter((e) => e.fullId !== entry.fullId));
      // Reload data to update stats
      await loadData();
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Error deleting entry. Please try again.");
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      
      {/* KPI Row - Updated to 4 Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1: Total Patients (Static 50) */}
        <GlassCard>
          <div className="text-xs font-bold text-white/70">Total Individuals</div>
          <div className="mt-2 text-2xl font-bold text-white">{totalPatients}</div>
        </GlassCard>

        {/* Card 2: Entries Completed */}
        <GlassCard>
          <div className="text-xs font-bold text-white/70">Entries Completed</div>
          <div className="mt-2 text-2xl font-bold text-green-300">
            {loading ? "..." : completedCount}
          </div>
        </GlassCard>

        {/* Card 3: Pending */}
        <GlassCard>
          <div className="text-xs font-bold text-white/70">Pending</div>
          <div className="mt-2 text-2xl font-bold text-yellow-300">
            {loading ? "..." : pendingCount}
          </div>
        </GlassCard>

        {/* Card 4: Assessments Today */}
        <GlassCard>
          <div className="text-xs font-bold text-white/70">Assessments Today</div>
          <div className="mt-2 text-2xl font-bold text-blue-300">
            {loading ? "..." : assessmentsToday}
          </div>
        </GlassCard>

      </div>

      {/* Recent Entries Table */}
      <GlassCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Recent Entries</h3>
          <span className="text-sm text-white/70 font-medium">
            {loading 
              ? "Loading..." 
              : entries.length > 0 
                ? `Showing ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}` 
                : "No entries"}
          </span>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="text-xs text-white/70 font-bold text-left border-b border-white/20">
              <tr>
                <th className="py-3">ID</th>
                <th className="py-3">Name</th>
                <th className="py-3">Age</th>
                <th className="py-3">Assessment Date</th>
                <th className="py-3">Status</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/20">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-white/70">Loading entries...</td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-white/70">No entries found.</td>
                </tr>
              ) : (
                entries.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 text-white font-medium">P-{row.id}</td>
                    <td className="py-4 text-white font-bold">{row.name}</td>
                    <td className="py-4 text-white">{row.age}</td>
                    <td className="py-4 text-white">{row.date}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold backdrop-blur-sm border ${
                        row.status === "Completed" 
                          ? "bg-green-500/80 text-white border-green-500/50" 
                          : row.status === "In Progress" 
                          ? "bg-yellow-500/80 text-white border-yellow-500/50" 
                          : "bg-red-500/80 text-white border-red-500/50"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4">
                       <div className="flex items-center gap-2">
                          <button 
                            title="View"
                            onClick={() => handleView(row)}
                            className="p-2 rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button 
                            title="Edit"
                            onClick={() => handleEdit(row)}
                            className="p-2 rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button 
                            title="Delete"
                            onClick={() => handleDelete(row)}
                            className="p-2 rounded-md text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
