// src/app/dashboard/entries/EntriesPage.tsx
"use client";

import { useState, useEffect } from "react";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { db, auth } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { logActivity } from "@/lib/auditLogger";

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
      // Ensure we have the latest full data before deleting
      const docRef = doc(db, "physioAssessments", id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        alert("Entry not found. It may have already been deleted.");
        return;
      }

      const entryData: any = { id: docSnap.id, ...docSnap.data() };

      // 1) Move the document to an archive collection for potential restore
      await setDoc(doc(db, "deletedPhysioAssessments", id), entryData);

      // 2) Delete from the main collection
      await deleteDoc(doc(db, "physioAssessments", id));

      // 3) Log the deletion with the underlying docId for Governance restore
      const regDetails = entryData.registrationDetails || {};
      const fullName =
        regDetails.fullName ||
        [regDetails.firstName, regDetails.initials, regDetails.lastName].filter(Boolean).join(" ").trim() ||
        "Unknown Patient";

      const userName = auth.currentUser?.email || auth.currentUser?.displayName || "Admin";
      const userId = auth.currentUser?.uid || "unknown";
      await logActivity(
        userId,
        userName,
        "DELETED",
        `Deleted individual P-${id.slice(0, 6)} (${fullName}) [docId=${id}]`
      );

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
            className="px-4 py-2 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 transition-all shadow-lg border border-gray-600 whitespace-nowrap"
            title="Refresh entries"
          >
            ↻ Refresh
          </button>
          <button
            onClick={onNewEntry}
            className="px-4 py-2 bg-blue-900 text-white rounded-lg font-bold hover:bg-blue-800 transition-all shadow-lg border border-blue-800 whitespace-nowrap"
          >
            + New Entry
          </button>
        </div>
      </div>

      {/* Table - White card like image */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="text-xs text-gray-700 font-bold text-left border-b border-gray-300">
              <tr>
                <th className="py-3">ID</th>
                <th className="py-3">Name</th>
                <th className="py-3">Age</th>
                <th className="py-3">Assessment Date</th>
                <th className="py-3">Overall Status</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Loading entries...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No entries found. Create a new entry to get started.
                  </td>
                </tr>
              ) : (
                entries.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 text-gray-900 font-medium">P-{row.id.slice(0, 6)}</td>

                  <td className="py-4 text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold border border-blue-800">
                      {row.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>

                    <div>
                      <div className="font-bold text-gray-900">{row.name}</div>
                    </div>
                  </td>

                  <td className="py-4 text-gray-700">{row.age}</td>
                  <td className="py-4 text-gray-700">{row.date}</td>

                  <td className="py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white border border-blue-500">
                      {row.status}
                    </span>
                  </td>

                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <button
                        title="View"
                        onClick={() => handleView(row.fullData)}
                        className="p-2 rounded-md text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>

                      <button
                        title="Edit"
                        onClick={() => handleEdit(row.id, row.fullData)}
                        className="p-2 rounded-md text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>

                      <button
                        title="Delete"
                        onClick={() => handleDelete(row.id)}
                        className="p-2 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
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
      </div>
    </div>
  );
}
