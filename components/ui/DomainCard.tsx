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
  isRegistrationSaved?: boolean; // Whether registration details have been saved
  hasEntryId?: boolean; // Whether entry document exists
}

export default function DomainCard({ 
  onBack, 
  onSelect, 
  entryData,
  isRegistrationSaved = false,
  hasEntryId = false 
}: DomainCardProps) {
  const domainStatuses = getDomainStatuses(entryData);
  
  const domains = [
    {
      name: "Physiotherapy",
      color: "bg-blue-900",
      icon: BeakerIcon,
      status: domainStatuses.Physiotherapy,
      isLocked: false, // Always unlocked as it's the first step
    },
    {
      name: "Physiology",
      color: "bg-blue-700",
      icon: HeartIcon,
      status: domainStatuses.Physiology,
      isLocked: !isRegistrationSaved,
    },
    {
      name: "Biomechanics",
      color: "bg-blue-800",
      icon: FireIcon,
      status: domainStatuses.Biomechanics,
      isLocked: !isRegistrationSaved,
    },
    {
      name: "Nutrition",
      color: "bg-blue-800",
      icon: SunIcon,
      status: domainStatuses.Nutrition,
      isLocked: !isRegistrationSaved,
    },
    {
      name: "Psychology",
      color: "bg-blue-700",
      icon: LightBulbIcon,
      status: domainStatuses.Psychology,
      isLocked: !isRegistrationSaved,
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
            className="px-4 py-2 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 transition-all shadow-lg border border-gray-600 whitespace-nowrap"
          >
            ← Back
          </button>
        )}
      </div>

      {/* Domain Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {domains.map((d) => {
          const isDisabled = d.isLocked;

          return (
            <button
              key={d.name}
              onClick={() => {
                if (!isDisabled && onSelect) {
                  onSelect(d.name);
                } else if (isDisabled) {
                  alert("Please complete and save the Registration Details in Physiotherapy domain first.");
                }
              }}
              disabled={isDisabled}
              className={`group bg-gray-800 border rounded-xl shadow-lg transition p-6 flex flex-col items-center justify-center relative ${
                isDisabled
                  ? "border-gray-700 opacity-50 cursor-not-allowed"
                  : "border-gray-700 hover:bg-gray-700 hover:shadow-xl cursor-pointer"
              }`}
            >
              {/* Lock Badge */}
              {isDisabled && (
                <div className="absolute top-3 left-3">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeClass(
                    d.status
                  )}`}
                >
                  {isDisabled ? "Locked" : getStatusLabel(d.status)}
                </span>
              </div>

              <div
                className={`${d.color} w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-md ${
                  isDisabled ? "opacity-50" : ""
                }`}
              >
                <d.icon className="w-8 h-8" />
              </div>

              <h3 className={`mt-4 text-lg font-semibold ${isDisabled ? "text-gray-400" : "text-white"}`}>
                {d.name}
              </h3>

              <p className={`text-sm mt-1 ${isDisabled ? "text-gray-400" : "text-white/70"}`}>
                {isDisabled
                  ? "Complete Registration first →"
                  : d.status === "pending"
                  ? "Tap to start assessment →"
                  : d.status === "in_progress"
                  ? "Continue assessment →"
                  : "View assessment →"}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
