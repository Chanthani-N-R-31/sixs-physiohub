"use client";

import { useState, useEffect } from "react";
import { ExclamationTriangleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where } from "firebase/firestore";
import { getDomainStatuses } from "@/lib/domainStatus";
import { useRouter } from "next/navigation";

interface AttentionEntry {
  id: string;
  fullId: string;
  name: string;
  missingDomains: string[];
  completionPercentage: number;
}

export default function AssessmentsAttentionWidget() {
  const [attentionEntries, setAttentionEntries] = useState<AttentionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadAttentionEntries();
  }, []);

  const loadAttentionEntries = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "physioAssessments"),
        where("status", "in", ["incomplete", "in_progress"])
      );
      
      const snapshot = await getDocs(q);
      const entries: AttentionEntry[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const regDetails = data.registrationDetails || {};
        
        let fullName = regDetails.fullName || "";
        if (!fullName) {
          const parts = [regDetails.firstName, regDetails.initials, regDetails.lastName].filter(Boolean);
          fullName = parts.join(" ").trim() || "Unknown Patient";
        }

        const domainStatuses = getDomainStatuses(data);
        const domains = ["Physiotherapy", "Biomechanics", "Physiology", "Nutrition", "Psychology"];
        
        const completedCount = domains.filter(
          domain => domainStatuses[domain as keyof typeof domainStatuses] === "completed"
        ).length;
        
        const completionPercentage = Math.round((completedCount / domains.length) * 100);
        
        // Find missing or incomplete domains
        const missingDomains = domains.filter(
          domain => domainStatuses[domain as keyof typeof domainStatuses] !== "completed"
        );

        // Only include entries with significant missing data (< 80% complete)
        if (completionPercentage < 80 && missingDomains.length > 0) {
          entries.push({
            id: doc.id.slice(0, 6),
            fullId: doc.id,
            name: fullName,
            missingDomains: missingDomains.slice(0, 3), // Show max 3
            completionPercentage,
          });
        }
      });

      // Sort by completion percentage (lowest first) and limit to 5
      entries.sort((a, b) => a.completionPercentage - b.completionPercentage);
      setAttentionEntries(entries.slice(0, 5));
    } catch (error) {
      console.error("Error loading attention entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewEntry = (fullId: string) => {
    router.push(`/dashboard/entries?edit=${fullId}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (attentionEntries.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <ExclamationTriangleIcon className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-bold text-gray-900">Assessments Requiring Attention</h3>
        </div>
        <p className="text-gray-600 text-sm">All assessments are up to date! 🎉</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-bold text-gray-900">Assessments Requiring Attention</h3>
        </div>
        <span className="text-sm font-medium text-gray-600 bg-orange-100 px-3 py-1 rounded-full">
          {attentionEntries.length}
        </span>
      </div>

      <div className="space-y-3">
        {attentionEntries.map((entry) => (
          <div
            key={entry.fullId}
            onClick={() => handleViewEntry(entry.fullId)}
            className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900">P-{entry.id}</span>
                  <span className="text-sm text-gray-700">{entry.name}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500"
                      style={{ width: `${entry.completionPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-gray-600">{entry.completionPercentage}%</span>
                </div>
                <p className="text-xs text-gray-600">
                  Missing: {entry.missingDomains.join(", ")}
                  {entry.missingDomains.length >= 3 && "..."}
                </p>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {attentionEntries.length >= 5 && (
        <button
          onClick={() => router.push("/dashboard/entries")}
          className="mt-4 w-full text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center justify-center gap-1"
        >
          View All
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

