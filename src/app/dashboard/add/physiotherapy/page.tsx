// src/app/dashboard/add/physio/PhysioFormTabs.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth } from "@/lib/firebase";

import RegistrationDetails from "@/components/forms/physiotherapy/RegistrationDetails";
import InjuryHistory from "@/components/forms/physiotherapy/InjuryHistory";
import StaticPosture from "@/components/forms/physiotherapy/StaticPosture";
import ROM from "@/components/forms/physiotherapy/ROM";
import StrengthStability from "@/components/forms/physiotherapy/StrengthStability";
import FMS from "@/components/forms/physiotherapy/FMS";

interface PhysioFormTabsProps {
  onBack?: () => void;
  initialData?: any;
  entryId?: string | null;
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

export default function PhysioFormTabs({ onBack, initialData, entryId }: PhysioFormTabsProps) {
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
  const [allFormData, setAllFormData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(entryId || null);

  // Load initial data if editing - fetch fresh data from Firebase
  useEffect(() => {
    const loadEntryData = async () => {
      if (entryId) {
        try {
          setPatientId(entryId);
          // Fetch fresh data from Firebase to ensure we have the latest
          const docRef = doc(db, "physioAssessments", entryId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setAllFormData(data);
            
            if (data.registrationDetails) {
              setRegistrationDetailsData(data.registrationDetails);
              setIsRegistrationDetailsSaved(true);
            }
          } else if (initialData) {
            // Fallback to initialData if document doesn't exist
            setAllFormData(initialData);
            if (initialData.registrationDetails) {
              setRegistrationDetailsData(initialData.registrationDetails);
              setIsRegistrationDetailsSaved(true);
            }
          }
        } catch (error) {
          console.error("Error loading entry data:", error);
          // Fallback to initialData if fetch fails
          if (initialData) {
            setAllFormData(initialData);
            if (initialData.registrationDetails) {
              setRegistrationDetailsData(initialData.registrationDetails);
              setIsRegistrationDetailsSaved(true);
            }
          }
        }
      } else if (initialData) {
        // If no entryId but we have initialData, use it
        setAllFormData(initialData);
        if (initialData.registrationDetails) {
          setRegistrationDetailsData(initialData.registrationDetails);
          setIsRegistrationDetailsSaved(true);
        }
      }
    };
    
    loadEntryData();
  }, [entryId, initialData]);

  const handleRegistrationDetailsSave = async (data: any) => {
    setRegistrationDetailsData(data);
    setAllFormData((prev: any) => ({ ...prev, registrationDetails: data }));
    setIsRegistrationDetailsSaved(true);
    
    // Save registration details to Firebase
    try {
      const user = auth.currentUser;
      
      if (patientId) {
        // Update existing document
        await updateDoc(doc(db, "physioAssessments", patientId), {
          registrationDetails: data,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new document
        const docRef = await addDoc(collection(db, "physioAssessments"), {
          registrationDetails: data,
          status: "in_progress",
          createdBy: user?.uid || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setPatientId(docRef.id);
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving registration details:", error);
      alert("Error saving data. Please try again.");
    }
  };

  const handleSaveSection = useCallback((sectionName: string, sectionData: any) => {
    setAllFormData((prev: any) => ({ ...prev, [sectionName]: sectionData }));
  }, []);

  const handleSaveAllSections = async () => {
    if (!patientId) {
      alert("Please save Registration Details first.");
      return;
    }

    setSaving(true);
    try {
      const user = auth.currentUser;
      // Update the existing document with all form data
      await updateDoc(doc(db, "physioAssessments", patientId), {
        ...allFormData,
        status: "completed",
        updatedAt: serverTimestamp(),
        completedBy: user?.uid || null,
      });
      
      setSaveSuccess(true);
      // Don't navigate away - let user stay on the form
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving all sections:", error);
      alert("Error saving data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCurrentSection = useCallback(async (sectionName: string, sectionData: any) => {
    if (!patientId) {
      // Don't show alert for auto-saves, only for manual saves
      return;
    }

    try {
      // Update the form data state
      setAllFormData((prev: any) => ({ ...prev, [sectionName]: sectionData }));
      
      // Save to Firebase (silently, no alerts for auto-saves)
      await updateDoc(doc(db, "physioAssessments", patientId), {
        [sectionName]: sectionData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(`Error auto-saving ${sectionName}:`, error);
      // Don't show alert for auto-save errors to avoid interrupting user
    }
  }, [patientId]);

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
            key={patientId || "new"} // Force re-render when patientId changes
            initialData={registrationDetailsData || undefined}
            onSave={handleRegistrationDetailsSave}
          />
        );

      case 1:
        return (
          <InjuryHistory
            key={patientId || "new"} // Force re-render when patientId changes
            initialData={allFormData.injuryHistory}
            onSave={(data) => handleSaveCurrentSection("injuryHistory", data)}
          />
        );

      case 2:
        return (
          <StaticPosture
            key={patientId || "new"}
            initialData={allFormData.staticPosture}
            onSave={(data) => handleSaveCurrentSection("staticPosture", data)}
          />
        );

      case 3:
        return (
          <ROM
            key={patientId || "new"}
            initialData={allFormData.rom}
            onSave={(data) => handleSaveCurrentSection("rom", data)}
          />
        );

      case 4:
        return (
          <StrengthStability
            key={patientId || "new"}
            initialData={allFormData.strengthStability}
            onSave={(data) => handleSaveCurrentSection("strengthStability", data)}
          />
        );

      case 5:
        return (
          <FMS
            key={patientId || "new"}
            initialData={allFormData.fms}
            onSave={(data) => handleSaveCurrentSection("fms", data)}
          />
        );

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
            <div className="flex justify-end gap-3 mt-4">
              {saveSuccess && (
                <span className="text-green-600 text-sm flex items-center">
                  ✓ Saved successfully
                </span>
              )}
              <button
                onClick={handleSaveAllSections}
                disabled={saving || !patientId}
                className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save All Sections"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
