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
import DomainCompletionChart from "@/components/admin/DomainCompletionChart";
import DataGrowthChart from "@/components/admin/DataGrowthChart";
import CriticalAuditLogs from "@/components/admin/CriticalAuditLogs";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [totalPhysios, setTotalPhysios] = useState(0);
  const [totalIndividuals, setTotalIndividuals] = useState(0);
  const [completedAssessments, setCompletedAssessments] = useState(0);
  const [deletedRecords, setDeletedRecords] = useState(0);
  const [recentDeletions, setRecentDeletions] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [averageAssessments, setAverageAssessments] = useState(0);

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
      const userActivityMap = new Map<string, number>();
      
      assessmentsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.createdBy) {
          uniqueUsers.add(data.createdBy);
          userActivityMap.set(data.createdBy, (userActivityMap.get(data.createdBy) || 0) + 1);
        }
      });
      
      setTotalPhysios(uniqueUsers.size);
      setActiveUsers(uniqueUsers.size);
      
      // Calculate average assessments per user
      if (uniqueUsers.size > 0) {
        const avgAssessments = Math.round(total / uniqueUsers.size);
        setAverageAssessments(avgAssessments);
      }

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
          <h1 className="text-3xl font-bold text-black">Admin Overview</h1>
          <p className="text-black font-bold mt-1">
            System status and key performance metrics.
          </p>
        </div>
        <div className="text-sm text-black font-bold">
          Last updated: Just now
        </div>
      </div>

      {/* Alert Banner */}
      {recentDeletions > 0 && (
        <div className="bg-red-100 border border-red-400 rounded-xl p-4 flex items-start gap-4">
          <ExclamationCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-black">Governance Alert</h4>
            <p className="text-black text-sm mt-1">
              {recentDeletions} record{recentDeletions !== 1 ? "s" : ""}{" "}
              {recentDeletions !== 1 ? "have" : "has"} been deleted in the last
              24 hours. Please review the Data Governance module to ensure these
              deletions were authorized.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards - Glassmorphism like main dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-black uppercase tracking-wide">Total Physios</div>
              <div className="mt-2 text-3xl font-bold text-black">
                {loading ? "..." : totalPhysios}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <UsersIcon className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-black uppercase tracking-wide">Total Individuals</div>
              <div className="mt-2 text-3xl font-bold text-black">
                {loading ? "..." : totalIndividuals}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <UsersIcon className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-black uppercase tracking-wide">Completed Assessments</div>
              <div className="mt-2 text-3xl font-bold text-black">
                {loading ? "..." : completedAssessments}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <DocumentCheckIcon className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-black uppercase tracking-wide">Deleted Records</div>
              <div className="mt-2 text-3xl font-bold text-black">
                {loading ? "..." : deletedRecords}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <TrashIcon className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-black uppercase tracking-wide">Active Users</div>
              <div className="mt-2 text-3xl font-bold text-black">
                {loading ? "..." : activeUsers}
              </div>
              <div className="mt-1 text-sm text-black font-bold">
                Unique users with assessments
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <UsersIcon className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-black uppercase tracking-wide">Avg Assessments/User</div>
              <div className="mt-2 text-3xl font-bold text-black">
                {loading ? "..." : averageAssessments}
              </div>
              <div className="mt-1 text-sm text-black font-bold">
                Average per active user
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <DocumentCheckIcon className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DomainCompletionChart />
        <DataGrowthChart />
      </div>

      {/* Critical Audit Logs */}
      <CriticalAuditLogs />
    </div>
  );
}
