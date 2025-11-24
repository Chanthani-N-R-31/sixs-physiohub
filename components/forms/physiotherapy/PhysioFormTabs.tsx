"use client";

import { useState, useCallback, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth } from "@/lib/firebase";

import RegistrationDetails from "./RegistrationDetails";
import InjuryHistory from "./InjuryHistory";
import StaticPosture from "./StaticPosture";
import ROM from "./ROM";
import StrengthStability from "./StrengthStability";
import FMS from "./FMS";

interface PhysioFormTabsProps {
  onBack?: () => void;
  initialData?: any;
  entryId?: string | null;
}

export default function PhysioFormTabs({ onBack, initialData, entryId }: PhysioFormTabsProps) {
  const [activeTab, setActiveTab] = useState("registration");
  const [saving, setSaving] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(entryId || null);

  const [formData, setFormData] = useState({
    registrationDetails: initialData?.registrationDetails || {},
    injuryHistory: initialData?.injuryHistory || {},
    staticPosture: initialData?.staticPosture || {},
    rom: initialData?.rom || {},
    strengthStability: initialData?.strengthStability || {},
    fms: initialData?.fms || {},
  });

  useEffect(() => {
    if (entryId) {
      setPatientId(entryId);
      loadExistingData(entryId);
    }
  }, [entryId]);

  const loadExistingData = async (id: string) => {
    try {
      const docRef = doc(db, "physioAssessments", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          registrationDetails: data.registrationDetails || {},
          injuryHistory: data.injuryHistory || {},
          staticPosture: data.staticPosture || {},
          rom: data.rom || {},
          strengthStability: data.strengthStability || {},
          fms: data.fms || {},
        });
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleSave = useCallback(async (section: string, data: any) => {
    if (!auth.currentUser) {
      alert("You must be logged in to save data");
      return;
    }

    setSaving(true);
    try {
      const updatedData = { ...formData, [section]: data };
      setFormData(updatedData);

      if (patientId) {
        await updateDoc(doc(db, "physioAssessments", patientId), {
          ...updatedData,
          updatedAt: serverTimestamp(),
          updatedBy: auth.currentUser.uid,
        });
      } else {
        const docRef = await addDoc(collection(db, "physioAssessments"), {
          ...updatedData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: auth.currentUser.uid,
          updatedBy: auth.currentUser.uid,
          status: "in_progress",
        });
        setPatientId(docRef.id);
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error saving data. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [formData, patientId]);

  const tabs = [
    { id: "registration", label: "Registration Details" },
    { id: "injury", label: "Injury History" },
    { id: "posture", label: "Static Posture" },
    { id: "rom", label: "ROM" },
    { id: "strength", label: "Strength & Stability" },
    { id: "fms", label: "FMS" },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Physiotherapy Assessment</h2>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            ← Back
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-b-2 border-green-600 text-green-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        {activeTab === "registration" && (
          <RegistrationDetails
            initialData={formData.registrationDetails}
            onSave={(data) => handleSave("registrationDetails", data)}
          />
        )}
        {activeTab === "injury" && (
          <InjuryHistory
            initialData={formData.injuryHistory}
            onSave={(data) => handleSave("injuryHistory", data)}
          />
        )}
        {activeTab === "posture" && (
          <StaticPosture
            initialData={formData.staticPosture}
            onSave={(data) => handleSave("staticPosture", data)}
          />
        )}
        {activeTab === "rom" && (
          <ROM
            initialData={formData.rom}
            onSave={(data) => handleSave("rom", data)}
          />
        )}
        {activeTab === "strength" && (
          <StrengthStability
            initialData={formData.strengthStability}
            onSave={(data) => handleSave("strengthStability", data)}
          />
        )}
        {activeTab === "fms" && (
          <FMS
            initialData={formData.fms}
            onSave={(data) => handleSave("fms", data)}
          />
        )}
      </div>
    </div>
  );
}

