"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";

interface AuditLog {
  id: string;
  action: string;
  detail: string;
  user: string;
  time: string;
  timestamp: any;
}

export default function ActivityFeed() {
  const [filter, setFilter] = useState("all");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      loadLogs();
    }
  }, [filter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      let q;

      if (filter === "all") {
        // For all actions we can order directly by timestamp
        q = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"));
      } else {
        // Firestore requires a composite index for where+orderBy on different fields.
        // To avoid forced index creation, we only filter in Firestore and sort on the client.
        q = query(collection(db, "auditLogs"), where("action", "==", filter));
      }

      const querySnapshot = await getDocs(q);
      const loadedLogs: AuditLog[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : null;

        let timeStr = "Unknown";
        if (timestamp) {
          const now = new Date();
          const diffMs = now.getTime() - timestamp.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);

          if (diffMins < 1) {
            timeStr = "Just now";
          } else if (diffMins < 60) {
            timeStr = `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
          } else if (diffHours < 24) {
            timeStr = `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
          } else {
            timeStr = `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
          }
        }

        loadedLogs.push({
          id: doc.id,
          action: data.action || "UNKNOWN",
          detail: data.details || data.detail || "No details",
          user: data.userName || data.user || "Unknown",
          time: timeStr,
          timestamp: data.timestamp,
        });
      });

      // If we didn't order by timestamp in the query (filtered mode), sort on client by timestamp desc
      loadedLogs.sort((a, b) => {
        const ta = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0;
        const tb = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
        return tb - ta;
      });

      setLogs(loadedLogs);
    } catch (error) {
      console.error("Error loading audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Activity Feed</h2>
          <p className="text-white/70 mt-1 font-medium">
            Audit log of all system actions.
          </p>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
        >
          <option value="all" className="text-gray-900">
            All Actions
          </option>
          <option value="CREATED" className="text-gray-900">
            Created
          </option>
          <option value="UPDATED" className="text-gray-900">
            Updated
          </option>
          <option value="DELETED" className="text-gray-900">
            Deleted
          </option>
          <option value="RESTORED" className="text-gray-900">
            Restored
          </option>
          <option value="CORRECTED" className="text-gray-900">
            Corrected
          </option>
        </select>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm text-left min-w-[700px]">
            <thead className="border-b border-gray-300 uppercase text-xs">
              <tr>
                <th className="p-4 text-gray-700 font-bold">Timestamp</th>
                <th className="p-4 text-gray-700 font-bold">User</th>
                <th className="p-4 text-gray-700 font-bold">Action</th>
                <th className="p-4 text-gray-700 font-bold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    Loading activity logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No activity logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 text-gray-600 whitespace-nowrap">
                      {log.time}
                    </td>
                    <td className="p-4 font-bold text-gray-900">{log.user}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                          log.action === "DELETED"
                            ? "bg-red-600 text-white border-red-500"
                            : log.action === "CREATED"
                            ? "bg-green-600 text-white border-green-500"
                            : log.action === "RESTORED"
                            ? "bg-purple-600 text-white border-purple-500"
                            : log.action === "CORRECTED"
                            ? "bg-orange-600 text-white border-orange-500"
                            : "bg-blue-600 text-white border-blue-500"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-gray-700">{log.detail}</td>
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
