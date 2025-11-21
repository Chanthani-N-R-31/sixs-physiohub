// src/app/dashboard/overview/OverviewPage.tsx
"use client";

import { useState, useEffect } from "react";
import {
  ArrowUpRightIcon,
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
  const [totalPatients, setTotalPatients] = useState(0);
  const [assessmentsToday, setAssessmentsToday] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch recent entries (last 5)
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
          id: docSnapshot.id.slice(0, 6),
          name: fullName,
          age: String(age),
          date: date,
          status: status,
        });
      });
      
      setEntries(loadedEntries);

      // Fetch total count
      const allQuery = query(collection(db, "physioAssessments"));
      const allSnapshot = await getDocs(allQuery);
      setTotalPatients(allSnapshot.size);

      // Count assessments today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let todayCount = 0;
      allSnapshot.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : null;
        if (createdAt && createdAt >= today) {
          todayCount++;
        }
      });
      setAssessmentsToday(todayCount);
    } catch (error) {
      console.error("Error loading overview data:", error);
    } finally {
      setLoading(false);
    }
  };

  const pendingReports = entries.filter((d) => d.status === "In Progress" || d.status === "Pending").length;

  return (
    <div className="w-full overflow-x-hidden">
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Total Individuals</div>
              <div className="mt-2 text-2xl font-bold text-gray-900">
                {totalPatients}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="text-xs text-gray-500">Assessments Today</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {loading ? "..." : assessmentsToday}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="text-xs text-gray-500">Pending Reports</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {pendingReports}
          </div>
        </div>
      </div>

      {/* Recent Entries Table */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Entries
          </h3>
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
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="py-4 text-gray-900">P-{row.id}</td>

                  <td className="py-4 text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-700">
                      {row.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>

                    <div>
                      <div className="font-medium">{row.name}</div>
                      <div className="text-xs text-gray-500">Physiotherapy</div>
                    </div>
                  </td>

                  <td className="py-4 text-gray-900">{row.age}</td>
                  <td className="py-4 text-gray-900">{row.date}</td>

                  <td className="py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        row.status === "Completed"
                          ? "bg-green-50 text-green-700"
                          : row.status === "Pending"
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>

                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <button
                        title="View"
                        className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>

                      <button
                        title="Edit"
                        className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>

                      <button
                        title="Delete"
                        className="p-2 rounded-md text-red-600 hover:bg-red-50"
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
