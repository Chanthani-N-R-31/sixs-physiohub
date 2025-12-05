"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { db } from "@/lib/firebase";
import { collection, query, getDocs } from "firebase/firestore";
import { getDomainStatuses } from "@/lib/domainStatus";

interface DomainCompletionData {
  domain: string;
  completed: number;
  inProgress: number;
  pending: number;
  completionRate: number;
}

export default function DomainCompletionChart() {
  const [data, setData] = useState<DomainCompletionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "physioAssessments"));
      const snapshot = await getDocs(q);

      const domains = ["Physiotherapy", "Biomechanics", "Physiology", "Nutrition", "Psychology"];
      const domainStats: Record<string, { completed: number; inProgress: number; pending: number; total: number }> = {};

      domains.forEach(domain => {
        domainStats[domain] = { completed: 0, inProgress: 0, pending: 0, total: 0 };
      });

      snapshot.forEach((doc) => {
        const entryData = doc.data();
        const domainStatuses = getDomainStatuses(entryData);

        domains.forEach(domain => {
          domainStats[domain].total++;
          const status = domainStatuses[domain as keyof typeof domainStatuses];
          if (status === "completed") {
            domainStats[domain].completed++;
          } else if (status === "in_progress") {
            domainStats[domain].inProgress++;
          } else {
            domainStats[domain].pending++;
          }
        });
      });

      const chartData: DomainCompletionData[] = domains.map(domain => {
        const stats = domainStats[domain];
        const completionRate = stats.total > 0 
          ? Math.round((stats.completed / stats.total) * 100) 
          : 0;

        return {
          domain,
          completed: stats.completed,
          inProgress: stats.inProgress,
          pending: stats.pending,
          completionRate,
        };
      });

      setData(chartData);
    } catch (error) {
      console.error("Error loading domain completion data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Completion Rates by Domain</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="domain" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px'
            }}
            formatter={(value: any) => [value, '']}
          />
          <Legend />
          <Bar dataKey="completed" fill="#10b981" name="Completed" />
          <Bar dataKey="inProgress" fill="#f59e0b" name="In Progress" />
          <Bar dataKey="pending" fill="#9ca3af" name="Pending" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-5 gap-2 text-center">
        {data.map((item) => (
          <div key={item.domain} className="p-2 bg-gray-50 rounded">
            <div className="text-xs font-medium text-gray-600 mb-1">{item.domain}</div>
            <div className="text-lg font-bold text-teal-600">{item.completionRate}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

