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
        q = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"));
      } else {
        q = query(
          collection(db, "auditLogs"),
          where("action", "==", filter),
          orderBy("timestamp", "desc")
        );
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
            timeStr = `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
          } else if (diffHours < 24) {
            timeStr = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
          } else {
            timeStr = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
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

      setLogs(loadedLogs);
    } catch (error) {
      console.error("Error loading audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Activity Feed</h2>
          <p className="text-sm text-slate-500">Audit log of all system actions.</p>
        </div>
        
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-green-500 outline-none"
        >
          <option value="all">All Actions</option>
          <option value="CREATED">Created</option>
          <option value="UPDATED">Updated</option>
          <option value="DELETED">Deleted</option>
          <option value="RESTORED">Restored</option>
          <option value="CORRECTED">Corrected</option>
        </select>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-xs">
            <tr>
              <th className="p-4">Timestamp</th>
              <th className="p-4">User</th>
              <th className="p-4">Action</th>
              <th className="p-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">Loading activity logs...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">No activity logs found.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-500 whitespace-nowrap">{log.time}</td>
                  <td className="p-4 font-medium text-slate-900">{log.user}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                      log.action === 'DELETED' ? 'bg-red-50 text-red-700 border-red-200' :
                      log.action === 'CREATED' ? 'bg-green-50 text-green-700 border-green-200' :
                      log.action === 'RESTORED' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      log.action === 'CORRECTED' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700">{log.detail}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

