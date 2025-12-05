"use client";

import { useState, useEffect } from "react";
import { ClockIcon, UserIcon, DocumentTextIcon, TrashIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

interface ActivityItem {
  id: string;
  action: string;
  userName: string;
  detail: string;
  timestamp: Date;
  type: "created" | "updated" | "deleted" | "completed";
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
    // Refresh every 30 seconds
    const interval = setInterval(loadActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "auditLogs"),
        orderBy("timestamp", "desc"),
        limit(10)
      );

      const snapshot = await getDocs(q);
      const items: ActivityItem[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date();
        
        let type: ActivityItem["type"] = "updated";
        if (data.action === "CREATED") type = "created";
        else if (data.action === "DELETED") type = "deleted";
        else if (data.action === "COMPLETED" || data.detail?.toLowerCase().includes("completed")) type = "completed";

        items.push({
          id: doc.id,
          action: data.action || "UPDATED",
          userName: data.userName || "Unknown User",
          detail: data.detail || data.details || "Activity",
          timestamp,
          type,
        });
      });

      setActivities(items);
    } catch (error) {
      console.error("Error loading activities:", error);
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

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "created":
        return <DocumentTextIcon className="w-4 h-4" />;
      case "deleted":
        return <TrashIcon className="w-4 h-4" />;
      case "completed":
        return <CheckCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "created":
        return "bg-blue-100 text-blue-700";
      case "deleted":
        return "bg-red-100 text-red-700";
      case "completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 h-full">
      <div className="flex items-center gap-2 mb-4">
        <ClockIcon className="w-5 h-5 text-gray-700" />
        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <ClockIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-lg ${getActivityColor(activity.type)} flex-shrink-0`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">
                    {activity.detail}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <UserIcon className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600">{activity.userName}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

