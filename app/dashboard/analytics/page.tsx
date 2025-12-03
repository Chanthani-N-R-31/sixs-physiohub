"use client";

import { useState, useEffect } from "react";
import {
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { getDomainStatuses } from "@/lib/domainStatus";

interface DomainBreakdown {
  Physiotherapy: { completed: number; inProgress: number; pending: number };
  Biomechanics: { completed: number; inProgress: number; pending: number };
  Physiology: { completed: number; inProgress: number; pending: number };
  Nutrition: { completed: number; inProgress: number; pending: number };
  Psychology: { completed: number; inProgress: number; pending: number };
}

interface SectionCompletion {
  section: string;
  completed: number;
  total: number;
  percentage: number;
}

interface WeeklyTrend {
  week: string;
  total: number;
  completed: number;
  inProgress: number;
}

interface AnalyticsStats {
  totalAssessments: number;
  completedAssessments: number;
  inProgressAssessments: number;
  pendingAssessments: number;
  assessmentsToday: number;
  assessmentsThisWeek: number;
  physioAssessments: number;
  biomechanicsAssessments: number;
  completionRate: number;
  domainBreakdown: DomainBreakdown;
  physioSectionCompletion: SectionCompletion[];
  biomechSectionCompletion: SectionCompletion[];
  assessmentsByMonth: { month: string; count: number; completed: number }[];
  weeklyTrends: WeeklyTrend[];
  crossDomainPatterns: {
    allFive: number;
    physioOnly: number;
    physioBiomech: number;
    physioBiomechOthers: number;
  };
  dataQuality: {
    incompleteAssessments: number;
    staleAssessments: number;
    avgCompletionTime: number;
  };
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"all" | "week" | "month" | "quarter">("all");
  const [stats, setStats] = useState<AnalyticsStats>({
    totalAssessments: 0,
    completedAssessments: 0,
    inProgressAssessments: 0,
    pendingAssessments: 0,
    assessmentsToday: 0,
    assessmentsThisWeek: 0,
    physioAssessments: 0,
    biomechanicsAssessments: 0,
    completionRate: 0,
    domainBreakdown: {
      Physiotherapy: { completed: 0, inProgress: 0, pending: 0 },
      Biomechanics: { completed: 0, inProgress: 0, pending: 0 },
      Physiology: { completed: 0, inProgress: 0, pending: 0 },
      Nutrition: { completed: 0, inProgress: 0, pending: 0 },
      Psychology: { completed: 0, inProgress: 0, pending: 0 },
    },
    physioSectionCompletion: [],
    biomechSectionCompletion: [],
    assessmentsByMonth: [],
    weeklyTrends: [],
    crossDomainPatterns: {
      allFive: 0,
      physioOnly: 0,
      physioBiomech: 0,
      physioBiomechOthers: 0,
    },
    dataQuality: {
      incompleteAssessments: 0,
      staleAssessments: 0,
      avgCompletionTime: 0,
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

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      let total = 0;
      let completed = 0;
      let inProgress = 0;
      let pending = 0;
      let todayCount = 0;
      let weekCount = 0;
      const monthlyData: { [key: string]: { total: number; completed: number } } = {};
      const weeklyData: { [key: string]: WeeklyTrend } = {};
      
      const domainBreakdown: DomainBreakdown = {
        Physiotherapy: { completed: 0, inProgress: 0, pending: 0 },
        Biomechanics: { completed: 0, inProgress: 0, pending: 0 },
        Physiology: { completed: 0, inProgress: 0, pending: 0 },
        Nutrition: { completed: 0, inProgress: 0, pending: 0 },
        Psychology: { completed: 0, inProgress: 0, pending: 0 },
      };

      const physioSectionCounts: { [key: string]: { completed: number; total: number } } = {
        registrationDetails: { completed: 0, total: 0 },
        injuryHistory: { completed: 0, total: 0 },
        staticPosture: { completed: 0, total: 0 },
        rom: { completed: 0, total: 0 },
        strengthStability: { completed: 0, total: 0 },
        fms: { completed: 0, total: 0 },
      };

      const crossDomainPatterns = {
        allFive: 0,
        physioOnly: 0,
        physioBiomech: 0,
        physioBiomechOthers: 0,
      };

      let incompleteCount = 0;
      let staleCount = 0;
      const completionTimes: number[] = [];

      physioSnapshot.forEach((doc) => {
        total++;
        const data = doc.data();
        
        // Global status
        if (data.status === "completed") {
          completed++;
        } else if (data.status === "in_progress") {
          inProgress++;
        } else {
          pending++;
        }

        // Date tracking
        if (data.createdAt) {
          const createdAt = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
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

          // Weekly grouping
          const weekStart = new Date(createdAt);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          const weekKey = weekStart.toISOString().split('T')[0];
          if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = { week: weekKey, total: 0, completed: 0, inProgress: 0 };
          }
          weeklyData[weekKey].total++;
          if (data.status === "completed") {
            weeklyData[weekKey].completed++;
          } else if (data.status === "in_progress") {
            weeklyData[weekKey].inProgress++;
          }

          // Completion time calculation
          if (data.status === "completed" && data.updatedAt) {
            const updatedAt = data.updatedAt.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt);
            const diffDays = (updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
            if (diffDays > 0 && diffDays < 365) {
              completionTimes.push(diffDays);
            }
          }

          // Stale assessments (in progress > 30 days)
          if (data.status === "in_progress" && createdAt < thirtyDaysAgo) {
            staleCount++;
          }
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

        // Cross-domain patterns
        const physioComplete = domainStatuses.Physiotherapy === "completed";
        const biomechComplete = domainStatuses.Biomechanics === "completed";
        const othersComplete = 
          domainStatuses.Physiology === "completed" &&
          domainStatuses.Nutrition === "completed" &&
          domainStatuses.Psychology === "completed";

        if (physioComplete && biomechComplete && othersComplete) {
          crossDomainPatterns.allFive++;
        } else if (physioComplete && biomechComplete) {
          crossDomainPatterns.physioBiomechOthers++;
        } else if (physioComplete && biomechComplete) {
          crossDomainPatterns.physioBiomech++;
        } else if (physioComplete) {
          crossDomainPatterns.physioOnly++;
        }

        // Physio section completion
        Object.keys(physioSectionCounts).forEach((section) => {
          physioSectionCounts[section].total++;
          const sectionData = data[section] || {};
          const hasData = Object.keys(sectionData).length > 0 && 
            Object.values(sectionData).some(v => v !== null && v !== undefined && v !== "");
          if (hasData) {
            physioSectionCounts[section].completed++;
          }
        });

        // Incomplete assessments
        if (data.status !== "completed" && data.status !== "pending") {
          incompleteCount++;
        }
      });

      // Fetch biomechanics assessments
      let biomechanicsCount = 0;
      const biomechSectionCounts: { [key: string]: { completed: number; total: number } } = {
        metadata: { completed: 0, total: 0 },
        running: { completed: 0, total: 0 },
        spatiotemporal: { completed: 0, total: 0 },
        kinematic: { completed: 0, total: 0 },
        impact: { completed: 0, total: 0 },
        variability: { completed: 0, total: 0 },
        loadCarriage: { completed: 0, total: 0 },
        strength: { completed: 0, total: 0 },
        powerTests: { completed: 0, total: 0 },
      };

      try {
        const biomechQuery = query(
          collection(db, "biomechanicsAssessments"),
          orderBy("createdAt", "desc")
        );
        const biomechSnapshot = await getDocs(biomechQuery);
        biomechSnapshot.forEach((doc) => {
          biomechanicsCount++;
          const data = doc.data();
          Object.keys(biomechSectionCounts).forEach((section) => {
            biomechSectionCounts[section].total++;
            const sectionData = data[section] || {};
            const hasData = Object.keys(sectionData).length > 0 && 
              Object.values(sectionData).some(v => v !== null && v !== undefined && v !== "");
            if (hasData) {
              biomechSectionCounts[section].completed++;
            }
          });
        });
      } catch (error) {
        console.warn("Biomechanics collection not available:", error);
      }

      // Convert section counts to percentages
      const physioSectionCompletion: SectionCompletion[] = Object.entries(physioSectionCounts)
        .map(([section, counts]) => ({
          section: section.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim(),
          completed: counts.completed,
          total: counts.total,
          percentage: counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0,
        }));

      const biomechSectionCompletion: SectionCompletion[] = Object.entries(biomechSectionCounts)
        .map(([section, counts]) => ({
          section: section.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim(),
          completed: counts.completed,
          total: counts.total,
          percentage: counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0,
        }));

      // Convert monthly data to array
      const assessmentsByMonth = Object.entries(monthlyData)
        .map(([month, data]) => ({ month, count: data.total, completed: data.completed }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6);

      // Convert weekly data to array and sort
      const weeklyTrends = Object.values(weeklyData)
        .sort((a, b) => a.week.localeCompare(b.week))
        .slice(-8)
        .map(item => ({
          ...item,
          week: new Date(item.week).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        }));

      // Calculate average completion time
      const avgCompletionTime = completionTimes.length > 0
        ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length * 10) / 10
        : 0;

      setStats({
        totalAssessments: total,
        completedAssessments: completed,
        inProgressAssessments: inProgress,
        pendingAssessments: pending,
        assessmentsToday: todayCount,
        assessmentsThisWeek: weekCount,
        physioAssessments: total,
        biomechanicsAssessments: biomechanicsCount,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        domainBreakdown,
        physioSectionCompletion,
        biomechSectionCompletion,
        assessmentsByMonth,
        weeklyTrends,
        crossDomainPatterns,
        dataQuality: {
          incompleteAssessments: incompleteCount,
          staleAssessments: staleCount,
          avgCompletionTime,
        },
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = (analyticsData: AnalyticsStats) => {
    const csvRows: string[] = [];
    
    csvRows.push("Analytics Export");
    csvRows.push(`Generated: ${new Date().toLocaleString()}`);
    csvRows.push("");
    
    csvRows.push("Summary Statistics");
    csvRows.push(`Total Assessments,${analyticsData.totalAssessments}`);
    csvRows.push(`Completed,${analyticsData.completedAssessments}`);
    csvRows.push(`In Progress,${analyticsData.inProgressAssessments}`);
    csvRows.push(`Pending,${analyticsData.pendingAssessments}`);
    csvRows.push(`Completion Rate,${analyticsData.completionRate}%`);
    
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `analytics-${new Date().toISOString().split('T')[0]}.csv`);
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
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-gray-300 mt-1">Data analysis and visualizations</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Filter */}
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
          
          {/* Export Button */}
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
            <div className="p-3 bg-teal-900/30 rounded-lg">
              <DocumentTextIcon className="w-6 h-6 text-teal-400" />
            </div>
          </div>
          <h3 className="text-gray-300 text-sm font-medium mb-1">Total Assessments</h3>
          <p className="text-3xl font-bold text-white">{stats.totalAssessments}</p>
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
            <div className="p-3 bg-yellow-900/30 rounded-lg">
              <ClockIcon className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
          <h3 className="text-gray-300 text-sm font-medium mb-1">In Progress</h3>
          <p className="text-3xl font-bold text-white">{stats.inProgressAssessments}</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-900/30 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <h3 className="text-gray-300 text-sm font-medium mb-1">This Week</h3>
          <p className="text-3xl font-bold text-white">{stats.assessmentsThisWeek}</p>
          <p className="text-xs text-gray-400 mt-1">{stats.assessmentsToday} today</p>
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

      {/* Cross-Domain Completion Patterns */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Cross-Domain Completion Patterns</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">All 5 Domains</h3>
            <p className="text-3xl font-bold text-green-600">{stats.crossDomainPatterns.allFive}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalAssessments > 0 
                ? Math.round((stats.crossDomainPatterns.allFive / stats.totalAssessments) * 100) 
                : 0}% of total
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Physio + Biomech</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.crossDomainPatterns.physioBiomech}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalAssessments > 0 
                ? Math.round((stats.crossDomainPatterns.physioBiomech / stats.totalAssessments) * 100) 
                : 0}% of total
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Physio Only</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.crossDomainPatterns.physioOnly}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalAssessments > 0 
                ? Math.round((stats.crossDomainPatterns.physioOnly / stats.totalAssessments) * 100) 
                : 0}% of total
            </p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-2">With Others</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.crossDomainPatterns.physioBiomechOthers}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalAssessments > 0 
                ? Math.round((stats.crossDomainPatterns.physioBiomechOthers / stats.totalAssessments) * 100) 
                : 0}% of total
            </p>
          </div>
        </div>
      </div>

      {/* Section Completion - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Physiotherapy Sections */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Physiotherapy Section Completion</h2>
          <div className="space-y-4">
            {stats.physioSectionCompletion.map((section, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{section.section}</span>
                  <span className="text-sm font-bold text-gray-900">
                    {section.completed}/{section.total} ({section.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-teal-600 h-3 rounded-full transition-all"
                    style={{ width: `${section.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Biomechanics Sections */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Biomechanics Section Completion</h2>
          <div className="space-y-4">
            {stats.biomechSectionCompletion.map((section, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{section.section}</span>
                  <span className="text-sm font-bold text-gray-900">
                    {section.completed}/{section.total} ({section.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${section.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Quality Metrics */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Data Quality Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
              <h3 className="text-sm font-medium text-gray-700">Incomplete Assessments</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-600">{stats.dataQuality.incompleteAssessments}</p>
            <p className="text-xs text-gray-500 mt-1">Started but not finished</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ClockIcon className="w-5 h-5 text-red-600" />
              <h3 className="text-sm font-medium text-gray-700">Stale Assessments</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.dataQuality.staleAssessments}</p>
            <p className="text-xs text-gray-500 mt-1">In progress &gt; 30 days</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-medium text-gray-700">Avg. Completion Time</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.dataQuality.avgCompletionTime}</p>
            <p className="text-xs text-gray-500 mt-1">Days to complete</p>
          </div>
        </div>
      </div>

      {/* Weekly Trends */}
      {stats.weeklyTrends.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Trends (Last 8 Weeks)</h2>
          <div className="space-y-3">
            {stats.weeklyTrends.map((week, index) => {
              const maxTotal = Math.max(...stats.weeklyTrends.map(w => w.total));
              const totalPercentage = maxTotal > 0 ? (week.total / maxTotal) * 100 : 0;
              const completedPercentage = week.total > 0 ? (week.completed / week.total) * 100 : 0;
              
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium text-gray-700">{week.week}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden relative">
                        <div
                          className="bg-green-600 h-full rounded-full absolute left-0"
                          style={{ width: `${completedPercentage}%` }}
                        />
                        <div
                          className="bg-yellow-500 h-full rounded-full absolute left-0"
                          style={{ width: `${totalPercentage}%`, opacity: 0.5 }}
                        />
                      </div>
                      <div className="w-24 text-xs text-right text-gray-600">
                        {week.completed}/{week.total} ({Math.round(completedPercentage)}%)
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded opacity-50"></div>
              <span>Total</span>
            </div>
          </div>
        </div>
      )}

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
                    <div className="w-32 text-sm font-medium text-gray-700">
                      {new Date(item.month + "-01").toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-xs text-gray-600">
                      {item.completed}/{item.count} completed ({Math.round(completedPct)}%)
                    </div>
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden relative">
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

