"use client";

import { getDomainStatuses } from "@/lib/domainStatus";

interface DomainProgressBarProps {
  entryData: any;
}

export default function DomainProgressBar({ entryData }: DomainProgressBarProps) {
  if (!entryData) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gray-400 w-0"></div>
        </div>
        <span className="text-xs font-medium text-gray-600">0% - 0/5</span>
      </div>
    );
  }

  const domainStatuses = getDomainStatuses(entryData);
  const domains = ["Physiotherapy", "Biomechanics", "Physiology", "Nutrition", "Psychology"];
  
  const completedCount = domains.filter(
    domain => domainStatuses[domain as keyof typeof domainStatuses] === "completed"
  ).length;
  
  const inProgressCount = domains.filter(
    domain => domainStatuses[domain as keyof typeof domainStatuses] === "in_progress"
  ).length;
  
  const totalDomains = domains.length;
  const completionPercentage = Math.round((completedCount / totalDomains) * 100);
  const activeCount = completedCount + inProgressCount;

  // Determine color based on completion
  let progressColor = "bg-gray-400";
  if (completionPercentage === 100) {
    progressColor = "bg-green-500";
  } else if (completionPercentage >= 60) {
    progressColor = "bg-teal-500";
  } else if (completionPercentage >= 30) {
    progressColor = "bg-yellow-500";
  } else {
    progressColor = "bg-orange-500";
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${progressColor} transition-all duration-300`}
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>
      <span className="text-xs font-bold text-gray-700 whitespace-nowrap">
        {completionPercentage}% - {activeCount}/{totalDomains} Domains
      </span>
    </div>
  );
}

