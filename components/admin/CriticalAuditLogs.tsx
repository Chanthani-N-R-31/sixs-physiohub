"use client";

import { useState, useEffect } from "react";
import { ExclamationTriangleIcon, TrashIcon, ClockIcon } from "@heroicons/react/24/outline";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface CriticalLog {
  id: string;
  action: string;
  userName: string;
  detail: string;
  timestamp: Date;
}

export default function CriticalAuditLogs() {
  const [logs, setLogs] = useState<CriticalLog[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadCriticalLogs();
    // Refresh every 30 seconds
    const interval = setInterval(loadCriticalLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadCriticalLogs = async () => {
    try {
      setLoading(true);
      // Get deletions and other critical actions
      const q = query(
        collection(db, "auditLogs"),
        where("action", "in", ["DELETED", "RESTORED", "CORRECTED"]),
        orderBy("timestamp", "desc"),
        limit(10)
      );

      const snapshot = await getDocs(q);
      const items: CriticalLog[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date();
        
        items.push({
          id: doc.id,
          action: data.action || "UNKNOWN",
          userName: data.userName || "Unknown User",
          detail: data.detail || data.details || "Critical action",
          timestamp,
        });
      });

      setLogs(items);
    } catch (error) {
      console.error("Error loading critical logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getActionColor = (action: string) => {
    if (action === "DELETED") return "bg-red-100 text-red-700 border-red-200";
    if (action === "RESTORED") return "bg-green-100 text-green-700 border-green-200";
    if (action === "CORRECTED") return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-bold text-gray-900">Critical Audit Logs</h3>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8">
          <TrashIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No critical actions recorded</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-lg border ${getActionColor(log.action)} flex-shrink-0`}>
                  <TrashIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                    {log.detail}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{log.userName}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      <span>{formatTimeAgo(log.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {logs.length > 0 && (
        <button
          onClick={() => router.push("/admin/activity")}
          className="mt-4 w-full text-sm font-medium text-teal-600 hover:text-teal-700 text-center"
        >
          View All Audit Logs →
        </button>
      )}
    </div>
  );
}

