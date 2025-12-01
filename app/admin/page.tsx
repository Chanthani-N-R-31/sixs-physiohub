"use client";

import React, { useState, useEffect } from "react";
import { 
  UsersIcon, 
  DocumentCheckIcon, 
  TrashIcon, 
  ExclamationCircleIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where } from "firebase/firestore";
import GlassCard from "@/components/ui/GlassCard";

// Helper Component for Stat Cards
function StatCard({ title, value, color, icon: Icon, loading }: any) {
  return (
    <GlassCard>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-white/70">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-2">
            {loading ? "..." : value}
          </h3>
        </div>
        <div className={`p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20`}>
          <Icon className={`w-6 h-6 text-white`} />
        </div>
      </div>
    </GlassCard>
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
          <p className="text-white/70 mt-1 font-medium">System status and key performance metrics.</p>
        </div>
        <div className="text-sm text-white/60 font-medium">Last updated: Just now</div>
      </div>

      {/* Alert Banner */}
      {recentDeletions > 0 && (
        <GlassCard className="bg-orange-500/20 border-orange-500/50">
          <div className="flex items-start gap-4">
            <ExclamationCircleIcon className="w-6 h-6 text-orange-300 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">Governance Alert</h4>
              <p className="text-white/90 text-sm mt-1">
                {recentDeletions} record{recentDeletions !== 1 ? 's' : ''} {recentDeletions !== 1 ? 'have' : 'has'} been deleted in the last 24 hours. Please review the Data Governance module to ensure these deletions were authorized.
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Physios" 
          value={totalPhysios} 
          color="bg-green-600" 
          icon={UsersIcon}
          loading={loading}
        />
        <StatCard 
          title="Total Individuals" 
          value={totalIndividuals} 
          color="bg-emerald-600" 
          icon={UsersIcon}
          loading={loading}
        />
        <StatCard 
          title="Completed Assessments" 
          value={completedAssessments} 
          color="bg-teal-600" 
          icon={DocumentCheckIcon}
          loading={loading}
        />
        <StatCard 
          title="Deleted Records" 
          value={deletedRecords} 
          color="bg-red-500" 
          icon={TrashIcon}
          loading={loading}
        />
      </div>

      {/* Recent System Activity Stub */}
      <GlassCard>
        <h3 className="text-lg font-bold text-white mb-4">System Health</h3>
        <div className="h-32 flex items-center justify-center bg-white/5 rounded-lg border border-dashed border-white/20 text-white/60">
          <ChartBarIcon className="w-6 h-6 mr-2" />
          Activity Chart Placeholder
        </div>
      </GlassCard>
    </div>
  );
}
