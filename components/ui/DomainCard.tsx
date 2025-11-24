// components/ui/DomainCard.tsx
"use client";

import {
  HeartIcon,
  BeakerIcon,
  FireIcon,
  SunIcon,
  LightBulbIcon,
} from "@heroicons/react/24/solid";

interface DomainCardProps {
  onBack?: () => void;
  onSelect?: (domain: string) => void;
}

export default function DomainCard({ onBack, onSelect }: DomainCardProps) {
  const domains = [
    {
      name: "Physiotherapy",
      color: "bg-green-600",
      icon: BeakerIcon,
    },
    {
      name: "Physiology",
      color: "bg-blue-600",
      icon: HeartIcon,
    },
    {
      name: "Biomechanics",
      color: "bg-orange-500",
      icon: FireIcon,
    },
    {
      name: "Nutrition",
      color: "bg-yellow-500",
      icon: SunIcon,
    },
    {
      name: "Psychology",
      color: "bg-purple-600",
      icon: LightBulbIcon,
    },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Select Domain</h2>

        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 whitespace-nowrap"
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
            className="group bg-white border border-gray-100 rounded-2xl shadow-md hover:shadow-lg transition p-6 flex flex-col items-center justify-center cursor-pointer"
          >
            <div
              className={`${d.color} w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-md`}
            >
              <d.icon className="w-8 h-8" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              {d.name}
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Tap to start assessment →
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

