"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { db } from "@/lib/firebase";
import { collection, query, getDocs } from "firebase/firestore";

interface GrowthDataPoint {
  date: string;
  assessments: number;
  completed: number;
  cumulative: number;
}

export default function DataGrowthChart() {
  const [data, setData] = useState<GrowthDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "physioAssessments"));
      const snapshot = await getDocs(q);

      // Group by month
      const monthlyData: Record<string, { assessments: number; completed: number }> = {};
      const allDates: Date[] = [];

      snapshot.forEach((doc) => {
        const entryData = doc.data();
        const createdAt = entryData.createdAt?.toDate ? entryData.createdAt.toDate() : new Date();
        allDates.push(createdAt);

        const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { assessments: 0, completed: 0 };
        }
        
        monthlyData[monthKey].assessments++;
        if (entryData.status === "completed") {
          monthlyData[monthKey].completed++;
        }
      });

      // Sort months and create cumulative data
      const sortedMonths = Object.keys(monthlyData).sort();
      const chartData: GrowthDataPoint[] = [];
      let cumulative = 0;

      sortedMonths.forEach((monthKey) => {
        const monthData = monthlyData[monthKey];
        cumulative += monthData.assessments;
        
        const [year, month] = monthKey.split('-');
        const dateLabel = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        });

        chartData.push({
          date: dateLabel,
          assessments: monthData.assessments,
          completed: monthData.completed,
          cumulative,
        });
      });

      // If no data, show last 6 months with zeros
      if (chartData.length === 0) {
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const dateLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          chartData.push({
            date: dateLabel,
            assessments: 0,
            completed: 0,
            cumulative: 0,
          });
        }
      }

      setData(chartData);
    } catch (error) {
      console.error("Error loading growth data:", error);
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
      <h3 className="text-lg font-bold text-gray-900 mb-4">Data Growth Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis yAxisId="left" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px'
            }}
          />
          <Legend />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="assessments" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="New Assessments"
            dot={{ fill: '#3b82f6', r: 4 }}
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="completed" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Completed"
            dot={{ fill: '#10b981', r: 4 }}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="cumulative" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Cumulative Total"
            dot={{ fill: '#8b5cf6', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

