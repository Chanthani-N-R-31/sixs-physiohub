"use client";

import { useState, useEffect } from "react";
import {
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  TrendingUpIcon,
  ArrowTrendingUpIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import { getDomainStatuses } from "@/lib/domainStatus";

interface UserActivity {
  userId: string;
  userName: string;
  assessmentsCreated: number;
  assessmentsCompleted: number;
  lastActivity: Date | null;
  completionRate: number;
}

interface AdminAnalyticsStats {
  totalUsers: number;
  totalAssessments: number;
  completedAssessments: number;
  inProgressAssessments: number;
  physioAssessments: number;
  biomechanicsAssessments: number;
  deletedRecords: number;
  recentDeletions: number;
  assessmentsByMonth: { month: string; count: number; completed: number }[];
  userActivity: UserActivity[];
  activityByAction: { [key: string]: number };
  assessmentsToday: number;
  assessmentsThisWeek: number;
  completionRate: number;
  domainBreakdown: {
    Physiotherapy: { completed: number; inProgress: number; pending: number };
    Biomechanics: { completed: number; inProgress: number; pending: number };
    Physiology: { completed: number; inProgress: number; pending: number };
    Nutrition: { completed: number; inProgress: number; pending: number };
    Psychology: { completed: number; inProgress: number; pending: number };
  };
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"all" | "week" | "month" | "quarter">("all");
  const [stats, setStats] = useState<AdminAnalyticsStats>({
    totalUsers: 0,
    totalAssessments: 0,
    completedAssessments: 0,
    inProgressAssessments: 0,
    physioAssessments: 0,
    biomechanicsAssessments: 0,
    deletedRecords: 0,
    recentDeletions: 0,
    assessmentsByMonth: [],
    userActivity: [],
    activityByAction: {},
    assessmentsToday: 0,
    assessmentsThisWeek: 0,
    completionRate: 0,
    domainBreakdown: {
      Physiotherapy: { completed: 0, inProgress: 0, pending: 0 },
      Biomechanics: { completed: 0, inProgress: 0, pending: 0 },
      Physiology: { completed: 0, inProgress: 0, pending: 0 },
      Nutrition: { completed: 0, inProgress: 0, pending: 0 },
      Psychology: { completed: 0, inProgress: 0, pending: 0 },
    },
  });

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch physio assessments
      const physioQuery = query(
        collection(db, "physioAssessments"),
        orderBy("createdAt", "desc")
      );
      const physioSnapshot = await getDocs(physioQuery);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let total = 0;
      let completed = 0;
      let inProgress = 0;
      let todayCount = 0;
      let weekCount = 0;
      const monthlyData: { [key: string]: { total: number; completed: number } } = {};
      const uniqueUsers = new Set<string>();
      const userStats: { [key: string]: UserActivity } = {};
      
      const domainBreakdown = {
        Physiotherapy: { completed: 0, inProgress: 0, pending: 0 },
        Biomechanics: { completed: 0, inProgress: 0, pending: 0 },
        Physiology: { completed: 0, inProgress: 0, pending: 0 },
        Nutrition: { completed: 0, inProgress: 0, pending: 0 },
        Psychology: { completed: 0, inProgress: 0, pending: 0 },
      };

      physioSnapshot.forEach((doc) => {
        total++;
        const data = doc.data();
        
        // Track unique users
        const userId = data.createdBy || "unknown";
        const userName = data.createdByEmail || data.createdByName || userId;
        if (userId !== "unknown") {
          uniqueUsers.add(userId);
        }
        
        // User activity tracking
        if (!userStats[userId]) {
          userStats[userId] = {
            userId,
            userName,
            assessmentsCreated: 0,
            assessmentsCompleted: 0,
            lastActivity: null,
            completionRate: 0,
          };
        }
        userStats[userId].assessmentsCreated++;
        if (data.status === "completed") {
          userStats[userId].assessmentsCompleted++;
        }
        
        // Update last activity
        if (data.createdAt) {
          const createdAt = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          if (!userStats[userId].lastActivity || createdAt > userStats[userId].lastActivity) {
            userStats[userId].lastActivity = createdAt;
          }
          
          if (createdAt >= today) todayCount++;
          if (createdAt >= weekAgo) weekCount++;

          // Monthly grouping
          const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}`;
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { total: 0, completed: 0 };
          }
          monthlyData[monthKey].total++;
          if (data.status === "completed") {
            monthlyData[monthKey].completed++;
          }
        }
        
        if (data.status === "completed") {
          completed++;
        } else if (data.status === "in_progress") {
          inProgress++;
        }

        // Domain status breakdown
        const domainStatuses = data.domainStatuses || getDomainStatuses(data);
        const domains = ["Physiotherapy", "Biomechanics", "Physiology", "Nutrition", "Psychology"] as const;
        
        domains.forEach((domain) => {
          const status = domainStatuses[domain] || "pending";
          if (status === "completed") {
            domainBreakdown[domain].completed++;
          } else if (status === "in_progress") {
            domainBreakdown[domain].inProgress++;
          } else {
            domainBreakdown[domain].pending++;
          }
        });
      });

      // Calculate user completion rates
      Object.values(userStats).forEach((user) => {
        user.completionRate = user.assessmentsCreated > 0
          ? Math.round((user.assessmentsCompleted / user.assessmentsCreated) * 100)
          : 0;
      });

      // Fetch biomechanics assessments
      let biomechanicsCount = 0;
      try {
        const biomechQuery = query(
          collection(db, "biomechanicsAssessments"),
          orderBy("createdAt", "desc")
        );
        const biomechSnapshot = await getDocs(biomechQuery);
        biomechSnapshot.forEach((doc) => {
          biomechanicsCount++;
          const data = doc.data();
          if (data.createdBy) {
            uniqueUsers.add(data.createdBy);
          }
        });
      } catch (error) {
        console.warn("Biomechanics collection not available:", error);
      }

      // Fetch audit logs for activity analysis
      let deletedCount = 0;
      let recentDeleted = 0;
      const activityByAction: { [key: string]: number } = {};
      
      try {
        const auditQuery = query(
          collection(db, "auditLogs"),
          orderBy("timestamp", "desc")
        );
        const auditSnapshot = await getDocs(auditQuery);
        
        auditSnapshot.forEach((doc) => {
          const data = doc.data();
          const action = data.action || "UNKNOWN";
          activityByAction[action] = (activityByAction[action] || 0) + 1;
          
          if (action === "DELETED") {
            deletedCount++;
            const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : null;
            if (timestamp && timestamp >= yesterday) {
              recentDeleted++;
            }
          }
        });
      } catch (error) {
        console.warn("Audit logs collection not available:", error);
      }

      // Convert monthly data to array
      const assessmentsByMonth = Object.entries(monthlyData)
        .map(([month, data]) => ({ month, count: data.total, completed: data.completed }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6);

      // Sort users by activity and take top 10
      const userActivity = Object.values(userStats)
        .sort((a, b) => b.assessmentsCreated - a.assessmentsCreated)
        .slice(0, 10);

      setStats({
        totalUsers: uniqueUsers.size,
        totalAssessments: total + biomechanicsCount,
        completedAssessments: completed,
        inProgressAssessments: inProgress,
        physioAssessments: total,
        biomechanicsAssessments: biomechanicsCount,
        deletedRecords: deletedCount,
        recentDeletions: recentDeleted,
        assessmentsByMonth,
        userActivity,
        activityByAction,
        assessmentsToday: todayCount,
        assessmentsThisWeek: weekCount,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        domainBreakdown,
      });
    } catch (error) {
      console.error("Error loading admin analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = (analyticsData: AdminAnalyticsStats) => {
    const csvRows: string[] = [];
    
    csvRows.push("Admin Analytics Export");
    csvRows.push(`Generated: ${new Date().toLocaleString()}`);
    csvRows.push("");
    
    csvRows.push("Summary Statistics");
    csvRows.push(`Total Users,${analyticsData.totalUsers}`);
    csvRows.push(`Total Assessments,${analyticsData.totalAssessments}`);
    csvRows.push(`Completed,${analyticsData.completedAssessments}`);
    csvRows.push(`Completion Rate,${analyticsData.completionRate}%`);
    
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `admin-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-white font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Analytics</h1>
          <p className="text-gray-300 mt-1">System analytics and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
            className="input-glass text-sm px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
          </select>
          <button
            onClick={() => exportAnalytics(stats)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700 transition-all shadow-lg border border-teal-500"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-900/30 rounded-lg">
              <UsersIcon className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <h3 className="text-gray-300 text-sm font-medium mb-1">Total Users</h3>
          <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-teal-900/30 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-teal-400" />
            </div>
          </div>
          <h3 className="text-gray-300 text-sm font-medium mb-1">Total Assessments</h3>
          <p className="text-3xl font-bold text-white">{stats.totalAssessments}</p>
          <p className="text-xs text-gray-400 mt-1">{stats.assessmentsThisWeek} this week</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-900/30 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <h3 className="text-gray-300 text-sm font-medium mb-1">Completed</h3>
          <p className="text-3xl font-bold text-white">{stats.completedAssessments}</p>
          <p className="text-xs text-gray-400 mt-1">{stats.completionRate}% completion rate</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-900/30 rounded-lg">
              <ShieldCheckIcon className="w-6 h-6 text-red-400" />
            </div>
          </div>
          <h3 className="text-gray-300 text-sm font-medium mb-1">Deleted Records</h3>
          <p className="text-3xl font-bold text-white">{stats.deletedRecords}</p>
          {stats.recentDeletions > 0 && (
            <p className="text-xs text-yellow-400 mt-1">{stats.recentDeletions} in last 24h</p>
          )}
        </div>
      </div>

      {/* Domain Status Breakdown */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Domain Status Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(stats.domainBreakdown).map(([domain, breakdown]) => {
            const total = breakdown.completed + breakdown.inProgress + breakdown.pending;
            const completedPct = total > 0 ? Math.round((breakdown.completed / total) * 100) : 0;
            
            return (
              <div key={domain} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-gray-700 mb-3">{domain}</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-bold text-green-600">{breakdown.completed}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">In Progress</span>
                    <span className="font-bold text-yellow-600">{breakdown.inProgress}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-bold text-gray-600">{breakdown.pending}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">Completion</span>
                      <span className="text-xs font-bold text-gray-900">{completedPct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${completedPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Activity & System Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Active Users</h2>
          <div className="space-y-4">
            {stats.userActivity.length > 0 ? (
              stats.userActivity.map((user, index) => (
                <div key={user.userId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                        <span className="text-teal-600 font-bold text-sm">#{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{user.userName}</h3>
                        <p className="text-xs text-gray-500">
                          {user.lastActivity 
                            ? `Last active: ${user.lastActivity.toLocaleDateString()}`
                            : "No recent activity"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div>
                      <p className="text-xs text-gray-600">Created</p>
                      <p className="text-lg font-bold text-gray-900">{user.assessmentsCreated}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Completed</p>
                      <p className="text-lg font-bold text-green-600">{user.assessmentsCompleted}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Rate</p>
                      <p className="text-lg font-bold text-blue-600">{user.completionRate}%</p>
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-600 h-2 rounded-full transition-all"
                      style={{ width: `${user.completionRate}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No user activity data available</p>
            )}
          </div>
        </div>

        {/* System Activity */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">System Activity Breakdown</h2>
          <div className="space-y-4">
            {Object.entries(stats.activityByAction).length > 0 ? (
              Object.entries(stats.activityByAction)
                .sort((a, b) => b[1] - a[1])
                .map(([action, count]) => {
                  const actionLabels: { [key: string]: string } = {
                    CREATED: "Created",
                    UPDATED: "Updated",
                    DELETED: "Deleted",
                    VIEWED: "Viewed",
                    EXPORTED: "Exported",
                  };
                  const actionColors: { [key: string]: string } = {
                    CREATED: "bg-green-500",
                    UPDATED: "bg-blue-500",
                    DELETED: "bg-red-500",
                    VIEWED: "bg-gray-500",
                    EXPORTED: "bg-purple-500",
                  };
                  
                  const maxCount = Math.max(...Object.values(stats.activityByAction));
                  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={action} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {actionLabels[action] || action}
                        </span>
                        <span className="text-sm font-bold text-gray-900">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`${actionColors[action] || "bg-gray-500"} h-3 rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
            ) : (
              <p className="text-gray-500 text-center py-4">No activity data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      {stats.assessmentsByMonth.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Monthly Trends (Last 6 Months)</h2>
          <div className="space-y-4">
            {stats.assessmentsByMonth.map((item, index) => {
              const maxCount = Math.max(...stats.assessmentsByMonth.map((i) => i.count));
              const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              const completedPct = item.count > 0 ? (item.completed / item.count) * 100 : 0;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">
                      {new Date(item.month + "-01").toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-xs text-gray-600">
                      {item.completed}/{item.count} ({Math.round(completedPct)}%)
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden relative">
                    <div
                      className="bg-teal-600 h-full rounded-full absolute left-0"
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-900">{item.count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

