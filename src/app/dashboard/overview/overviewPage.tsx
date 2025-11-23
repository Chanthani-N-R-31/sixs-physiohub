// src/app/dashboard/overview/OverviewPage.tsx
"use client";

import { useState, useEffect } from "react";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

interface Entry {
  id: string;
  name: string;
  age: string;
  date: string;
  status: string;
}

export default function OverviewPage() {
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
          name: fullName,
          age: String(regDetails.age || regDetails.yearsInService || "N/A"),
          date: date || "N/A",
          status: statusLabel,
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

  return (
    <div className="w-full overflow-x-hidden">
      
      {/* KPI Row - Updated to 4 Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1: Total Patients (Static 50) */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="text-xs text-gray-500">Total Individuals</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{totalPatients}</div>
        </div>

        {/* Card 2: Entries Completed */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="text-xs text-gray-500">Entries Completed</div>
          <div className="mt-2 text-2xl font-bold text-green-600">
            {loading ? "..." : completedCount}
          </div>
        </div>

        {/* Card 3: Pending */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="text-xs text-gray-500">Pending</div>
          <div className="mt-2 text-2xl font-bold text-orange-600">
            {loading ? "..." : pendingCount}
          </div>
        </div>

        {/* Card 4: Assessments Today */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="text-xs text-gray-500">Assessments Today</div>
          <div className="mt-2 text-2xl font-bold text-blue-600">
            {loading ? "..." : assessmentsToday}
          </div>
        </div>

      </div>

      {/* Recent Entries Table */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Entries</h3>
          <span className="text-sm text-gray-500">Showing latest 5</span>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="text-xs text-gray-500 text-left">
              <tr>
                <th className="py-2">Patient ID</th>
                <th className="py-2">Name</th>
                <th className="py-2">Age</th>
                <th className="py-2">Assessment Date</th>
                <th className="py-2">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
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
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="py-4 text-gray-900">P-{row.id}</td>
                    <td className="py-4 text-gray-900 font-medium">{row.name}</td>
                    <td className="py-4 text-gray-900">{row.age}</td>
                    <td className="py-4 text-gray-900">{row.date}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        row.status === "Completed" ? "bg-green-50 text-green-700" : 
                        row.status === "In Progress" ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-700"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="py-4">
                       <div className="flex items-center gap-2">
                          <button className="p-2 rounded-md text-gray-600 hover:bg-gray-100"><EyeIcon className="w-4 h-4" /></button>
                          <button className="p-2 rounded-md text-gray-600 hover:bg-gray-100"><PencilIcon className="w-4 h-4" /></button>
                          <button className="p-2 rounded-md text-red-600 hover:bg-red-50"><TrashIcon className="w-4 h-4" /></button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}