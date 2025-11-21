// src/app/dashboard/add/physio/PhysioFormTabs.tsx
"use client";

import { useState } from "react";

import RegistrationDetails from "@/components/forms/physiotherapy/RegistrationDetails";
import InjuryHistory from "@/components/forms/physiotherapy/InjuryHistory";
import StaticPosture from "@/components/forms/physiotherapy/StaticPosture";
import ROM from "@/components/forms/physiotherapy/ROM";
import StrengthStability from "@/components/forms/physiotherapy/StrengthStability";
import FMS from "@/components/forms/physiotherapy/FMS";

interface PhysioFormTabsProps {
  onBack?: () => void;
}

interface RegistrationDetailsData {
  name: string;
  dob: string;
  serviceNumber: string;
  age: string;
  gender: string;
  contact: string;
  trainingDepartment: string;
  rank: string;
  dateOfAssessment: string;
}

export default function PhysioFormTabs({ onBack }: PhysioFormTabsProps) {
  const tabs = [
    "Registration Details",
    "Injury Details",
    "Posture",
    "ROM & Flexibility",
    "Strength",
    "FMS",
  ];

  const [activeTab, setActiveTab] = useState(0);
  const [registrationDetailsData, setRegistrationDetailsData] =
    useState<RegistrationDetailsData | null>(null);
  const [isRegistrationDetailsSaved, setIsRegistrationDetailsSaved] = useState(false);

  const handleRegistrationDetailsSave = (data: RegistrationDetailsData) => {
    setRegistrationDetailsData(data);
    setIsRegistrationDetailsSaved(true);
  };

  const handleTabClick = (idx: number) => {
    // Allow access to Registration Details always, but require it to be saved for other tabs
    if (idx === 0 || isRegistrationDetailsSaved) {
      setActiveTab(idx);
    } else {
      alert("Please save Registration Details first before accessing other sections.");
    }
  };

  const renderSection = () => {
    switch (activeTab) {
      case 0:
        return (
          <RegistrationDetails
            initialData={registrationDetailsData || undefined}
            onSave={handleRegistrationDetailsSave}
          />
        );

      case 1:
        return <InjuryHistory />;

      case 2:
        return <StaticPosture />;

      case 3:
        return <ROM />;

      case 4:
        return <StrengthStability />;

      case 5:
        return <FMS />;

      default:
        return null;
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Physiotherapy Assessment
        </h2>

        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 whitespace-nowrap"
          >
            ← Back
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="sticky top-20 z-10 bg-white/60 backdrop-blur-md border-b border-gray-200 -mx-6 px-6">
        <div className="flex overflow-x-auto gap-3 py-3 scrollbar-hide">
          {tabs.map((tab, idx) => {
            const isDisabled = idx > 0 && !isRegistrationDetailsSaved;
            return (
              <button
                key={tab}
                onClick={() => handleTabClick(idx)}
                disabled={isDisabled}
                className={`px-4 py-2 whitespace-nowrap rounded-md text-sm font-medium transition
                  ${
                    activeTab === idx
                      ? "bg-green-600 text-white shadow-md"
                      : isDisabled
                      ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                      : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                  }
                `}
                title={
                  isDisabled
                    ? "Please save Registration Details first"
                    : undefined
                }
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Section */}
      <div className="mt-6 bg-white rounded-xl p-6 shadow-md border border-gray-100">
        {renderSection()}

        {/* Notes and Save Button - only show for non-Registration Details tabs */}
        {activeTab !== 0 && (
          <>
            {/* Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Assessments Findings
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-300"
                rows={4}
                placeholder="Add optional notes..."
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-4">
              <button className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 font-medium">
                Save Section
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
