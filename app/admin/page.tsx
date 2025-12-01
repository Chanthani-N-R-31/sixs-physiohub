"use client";

import React, { useState, useEffect } from "react";
import {
  UsersIcon,
  DocumentCheckIcon,
  TrashIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where } from "firebase/firestore";

// Helper Component for Stat Cards - solid dark style
function StatCard({ title, value, icon: Icon, loading }: any) {
  return (
    <div className="bg-[#1a4d4d] p-6 rounded-xl shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-white/80">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-2">
            {loading ? "..." : value}
          </h3>
        </div>
        <div className="p-3 rounded-lg bg-blue-500/20 text-white">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [totalPhysios, setTotalPhysios] = useState(0);
  const [totalIndividuals, setTotalIndividuals] = useState(0);
  const [completedAssessments, setCompletedAssessments] = useState(0);
  const [deletedRecords, setDeletedRecords] = useState(0);
  const [recentDeletions, setRecentDeletions] = useState(0);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      loadStats();
    }
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Fetch all assessments
      const assessmentsQuery = query(collection(db, "physioAssessments"));
      const assessmentsSnapshot = await getDocs(assessmentsQuery);
      
      let total = 0;
      let completed = 0;
      
      assessmentsSnapshot.forEach((doc) => {
        total++;
        const data = doc.data();
        if (data.status === "completed") {
          completed++;
        }
      });

      setTotalIndividuals(total);
      setCompletedAssessments(completed);

      // Fetch audit logs for deletions (with error handling in case collection doesn't exist)
      let deletedCount = 0;
      let recentDeleted = 0;
      
      try {
        const auditQuery = query(collection(db, "auditLogs"), where("action", "==", "DELETED"));
        const auditSnapshot = await getDocs(auditQuery);
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        auditSnapshot.forEach((doc) => {
          deletedCount++;
          const data = doc.data();
          const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : null;
          if (timestamp && timestamp >= yesterday) {
            recentDeleted++;
          }
        });
      } catch (auditError) {
        // If auditLogs collection doesn't exist yet, just set counts to 0
        console.warn("Audit logs collection not available:", auditError);
        deletedCount = 0;
        recentDeleted = 0;
      }

      setDeletedRecords(deletedCount);
      setRecentDeletions(recentDeleted);

      // For physios, we'll count unique users from assessments
      // In a real app, you'd have a users collection
      const uniqueUsers = new Set<string>();
      assessmentsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.createdBy) {
          uniqueUsers.add(data.createdBy);
        }
      });
      setTotalPhysios(uniqueUsers.size);

    } catch (error) {
      console.error("Error loading admin stats:", error);
      // Set default values on error
      setTotalPhysios(0);
      setTotalIndividuals(0);
      setCompletedAssessments(0);
      setDeletedRecords(0);
      setRecentDeletions(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Overview</h1>
          <p className="text-white/70 mt-1 font-medium">
            System status and key performance metrics.
          </p>
        </div>
        <div className="text-sm text-white/60 font-medium">
          Last updated: Just now
        </div>
      </div>

      {/* Alert Banner */}
      {recentDeletions > 0 && (
        <div className="bg-red-900/40 border border-red-600 rounded-xl p-4 flex items-start gap-4">
          <ExclamationCircleIcon className="w-6 h-6 text-red-300 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-white">Governance Alert</h4>
            <p className="text-white/90 text-sm mt-1">
              {recentDeletions} record{recentDeletions !== 1 ? "s" : ""}{" "}
              {recentDeletions !== 1 ? "have" : "has"} been deleted in the last
              24 hours. Please review the Data Governance module to ensure these
              deletions were authorized.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards - Dark blue like dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-900 rounded-xl p-6 shadow-lg border border-blue-800">
          <div className="text-xs font-bold text-white/80 uppercase tracking-wide">Total Physios</div>
          <div className="mt-2 text-3xl font-bold text-white">
            {loading ? "..." : totalPhysios}
          </div>
        </div>
        <div className="bg-blue-900 rounded-xl p-6 shadow-lg border border-blue-800">
          <div className="text-xs font-bold text-white/80 uppercase tracking-wide">Total Individuals</div>
          <div className="mt-2 text-3xl font-bold text-white">
            {loading ? "..." : totalIndividuals}
          </div>
        </div>
        <div className="bg-blue-900 rounded-xl p-6 shadow-lg border border-blue-800">
          <div className="text-xs font-bold text-white/80 uppercase tracking-wide">Completed Assessments</div>
          <div className="mt-2 text-3xl font-bold text-white">
            {loading ? "..." : completedAssessments}
          </div>
        </div>
        <div className="bg-blue-900 rounded-xl p-6 shadow-lg border border-blue-800">
          <div className="text-xs font-bold text-white/80 uppercase tracking-wide">Deleted Records</div>
          <div className="mt-2 text-3xl font-bold text-white">
            {loading ? "..." : deletedRecords}
          </div>
        </div>
      </div>

      {/* System Health Placeholder - White card */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">System Health</h3>
        <div className="h-32 flex items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-500 bg-gray-50">
          <ChartBarIcon className="w-6 h-6 mr-2" />
          Activity Chart Placeholder
        </div>
      </div>
    </div>
  );
}
