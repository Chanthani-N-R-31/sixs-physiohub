// components/ui/DomainCard.tsx
"use client";

import {
  HeartIcon,
  BeakerIcon,
  FireIcon,
  SunIcon,
  LightBulbIcon,
} from "@heroicons/react/24/solid";
import { getDomainStatuses, getStatusLabel, getStatusBadgeClass } from "@/lib/domainStatus";

interface DomainCardProps {
  onBack?: () => void;
  onSelect?: (domain: string) => void;
  entryData?: any; // Entry data to determine statuses
}

export default function DomainCard({ onBack, onSelect, entryData }: DomainCardProps) {
  const domainStatuses = getDomainStatuses(entryData);
  
  const domains = [
    {
      name: "Physiotherapy",
      color: "bg-[#1a4d4d]/80",
      icon: BeakerIcon,
      status: domainStatuses.Physiotherapy,
    },
    {
      name: "Physiology",
      color: "bg-blue-600/80",
      icon: HeartIcon,
      status: domainStatuses.Physiology,
    },
    {
      name: "Biomechanics",
      color: "bg-orange-500/80",
      icon: FireIcon,
      status: domainStatuses.Biomechanics,
    },
    {
      name: "Nutrition",
      color: "bg-yellow-500/80",
      icon: SunIcon,
      status: domainStatuses.Nutrition,
    },
    {
      name: "Psychology",
      color: "bg-purple-600/80",
      icon: LightBulbIcon,
      status: domainStatuses.Psychology,
    },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold text-white">Select Domain</h2>

        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-lg font-bold hover:bg-white/20 transition-all shadow-lg border border-white/30 whitespace-nowrap"
          >
            ← Back
          </button>
        )}
      </div>

      {/* Domain Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {domains.map((d) => (
          <button
            key={d.name}
            onClick={() => onSelect && onSelect(d.name)}
            className="group bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl hover:shadow-xl hover:bg-white/15 transition-all p-6 flex flex-col items-center justify-center cursor-pointer relative"
          >
            {/* Status Badge */}
            <div className="absolute top-3 right-3">
              <span
                className={`px-2 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${
                  d.status === "completed"
                    ? "bg-green-500/80 text-white border-green-500/50"
                    : d.status === "in_progress"
                    ? "bg-yellow-500/80 text-white border-yellow-500/50"
                    : "bg-white/20 text-white/80 border-white/30"
                }`}
              >
                {getStatusLabel(d.status)}
              </span>
            </div>

            <div
              className={`${d.color} backdrop-blur-sm w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-lg border border-white/30`}
            >
              <d.icon className="w-8 h-8" />
            </div>

            <h3 className="mt-4 text-lg font-bold text-white">
              {d.name}
            </h3>

            <p className="text-sm text-white/70 mt-1 font-medium">
              {d.status === "pending"
                ? "Tap to start assessment →"
                : d.status === "in_progress"
                ? "Continue assessment →"
                : "View assessment →"}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
