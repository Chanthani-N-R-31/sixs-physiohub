// src/app/dashboard/overview/OverviewPage.tsx
"use client";

import { useState, useEffect } from "react";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CheckCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { db, auth } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { logActivity } from "@/lib/auditLogger";
import ResumeWorkCard from "@/components/dashboard/ResumeWorkCard";
import DomainProgressBar from "@/components/dashboard/DomainProgressBar";
import AssessmentsAttentionWidget from "@/components/dashboard/AssessmentsAttentionWidget";
import ActivityFeed from "@/components/dashboard/ActivityFeed";

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
        
        // Format ID like P-CQW172 (first 6 chars of doc ID)
        const shortId = docSnapshot.id.slice(0, 6);
        
        loadedEntries.push({
          id: shortId,
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
      // Ensure we have the latest full data before deleting
      let entryData = entry.fullData;
      if (!entryData) {
        const docRef = doc(db, "physioAssessments", entry.fullId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          entryData = { id: docSnap.id, ...docSnap.data() };
        } else {
          alert("Entry not found. It may have already been deleted.");
          return;
        }
      }

      // 1) Move the document to an archive collection for potential restore
      await setDoc(doc(db, "deletedPhysioAssessments", entry.fullId), entryData);

      // 2) Delete from the main collection
      await deleteDoc(doc(db, "physioAssessments", entry.fullId));

      // 3) Log the deletion with the underlying docId for Governance restore
      const userName = auth.currentUser?.email || auth.currentUser?.displayName || "Admin";
      const userId = auth.currentUser?.uid || "unknown";
      await logActivity(
        userId,
        userName,
        "DELETED",
        `Deleted individual P-${entry.id} (${entry.name}) [docId=${entry.fullId}]`
      );

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
      {/* Resume Work Card - Prominent at Top */}
      <div className="mb-8">
        <ResumeWorkCard onResume={onEdit ? (entryId, entryData) => onEdit(entryId, entryData) : undefined} />
      </div>

      {/* KPI Row - Updated to 4 Columns with Glassmorphism Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1: Total Patients (Static 50) */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white/70 uppercase tracking-wide">Total Individuals</div>
              <div className="mt-2 text-3xl font-bold text-white">{totalPatients}</div>
            </div>
            <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Card 2: Entries Completed */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white/70 uppercase tracking-wide">Entries Completed</div>
              <div className="mt-2 text-3xl font-bold text-white">
                {loading ? "..." : completedCount}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <CheckCircleIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Card 3: Pending */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white/70 uppercase tracking-wide">Pending</div>
              <div className="mt-2 text-3xl font-bold text-white">
                {loading ? "..." : pendingCount}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <TrashIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Card 4: Assessments Today */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white/70 uppercase tracking-wide">Assessments Today</div>
              <div className="mt-2 text-3xl font-bold text-white">
                {loading ? "..." : assessmentsToday}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

      </div>

      {/* Main Content Grid with Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Entries Table - White card like image */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Recent Entries</h3>
          <span className="text-sm text-gray-600 font-medium">
            {loading 
              ? "Loading..." 
              : entries.length > 0 
                ? `Showing ${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}` 
                : "No entries"}
          </span>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="text-xs text-gray-700 font-bold text-left border-b border-gray-300">
              <tr>
                <th className="py-3">ID</th>
                <th className="py-3">Name</th>
                <th className="py-3">Age</th>
                <th className="py-3">Assessment Date</th>
                <th className="py-3">Progress</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">Loading entries...</td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">No entries found.</td>
                </tr>
              ) : (
                entries.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 text-gray-900 font-medium">P-{row.id}</td>
                    <td className="py-4 text-gray-900 font-bold">{row.name}</td>
                    <td className="py-4 text-gray-700">{row.age}</td>
                    <td className="py-4 text-gray-700">{row.date}</td>
                    <td className="py-4">
                      <DomainProgressBar entryData={row.fullData} />
                    </td>
                    <td className="py-4">
                       <div className="flex items-center gap-2">
                          <button 
                            title="View"
                            onClick={() => handleView(row)}
                            className="p-2 rounded-md text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button 
                            title="Edit"
                            onClick={() => handleEdit(row)}
                            className="p-2 rounded-md text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button 
                            title="Delete"
                            onClick={() => handleDelete(row)}
                            className="p-2 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
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
      </div>

          {/* Assessments Requiring Attention Widget */}
          <AssessmentsAttentionWidget />
        </div>

        {/* Right Sidebar - 1/3 width */}
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
