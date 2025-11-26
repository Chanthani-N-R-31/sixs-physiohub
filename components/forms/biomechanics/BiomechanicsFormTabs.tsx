"use client";

import { useState, useCallback, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth } from "@/lib/firebase";

import Metadata from "@/app/dashboard/add/biomechanics/sections/Metadata";
import Running from "@/app/dashboard/add/biomechanics/sections/Running";
import Spatiotemporal from "@/app/dashboard/add/biomechanics/sections/Spatiotemporal";
import Kinematic from "@/app/dashboard/add/biomechanics/sections/Kinematic";
import Impact from "@/app/dashboard/add/biomechanics/sections/Impact";
import Variability from "@/app/dashboard/add/biomechanics/sections/Variability";
import LoadCarriage from "@/app/dashboard/add/biomechanics/sections/LoadCarriage";
import Strength from "@/app/dashboard/add/biomechanics/sections/Strength";
import PowerTests from "@/app/dashboard/add/biomechanics/sections/PowerTests";

interface BiomechanicsFormTabsProps {
  onBack?: () => void;
  initialData?: any;
  entryId?: string | null;
}

export default function BiomechanicsFormTabs({ onBack, initialData, entryId }: BiomechanicsFormTabsProps) {
  const [activeTab, setActiveTab] = useState("metadata");
  const [saving, setSaving] = useState(false);
  const [entryIdState, setEntryIdState] = useState<string | null>(entryId || null);

  const [formData, setFormData] = useState({
    metadata: initialData?.metadata || {},
    running: initialData?.running || {},
    spatiotemporal: initialData?.spatiotemporal || {},
    kinematic: initialData?.kinematic || {},
    impact: initialData?.impact || {},
    variability: initialData?.variability || {},
    loadCarriage: initialData?.loadCarriage || {},
    strength: initialData?.strength || {},
    powerTests: initialData?.powerTests || {},
  });

  useEffect(() => {
    if (entryId) {
      setEntryIdState(entryId);
      loadExistingData(entryId);
    }
  }, [entryId]);

  const loadExistingData = async (id: string) => {
    try {
      const docRef = doc(db, "biomechanicsAssessments", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          metadata: data.metadata || {},
          running: data.running || {},
          spatiotemporal: data.spatiotemporal || {},
          kinematic: data.kinematic || {},
          impact: data.impact || {},
          variability: data.variability || {},
          loadCarriage: data.loadCarriage || {},
          strength: data.strength || {},
          powerTests: data.powerTests || {},
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

      if (entryIdState) {
        await updateDoc(doc(db, "biomechanicsAssessments", entryIdState), {
          ...updatedData,
          updatedAt: serverTimestamp(),
          updatedBy: auth.currentUser.uid,
        });
      } else {
        const docRef = await addDoc(collection(db, "biomechanicsAssessments"), {
          ...updatedData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: auth.currentUser.uid,
          updatedBy: auth.currentUser.uid,
          status: "in_progress",
        });
        setEntryIdState(docRef.id);
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error saving data. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [formData, entryIdState]);

  const tabs = [
    { id: "metadata", label: "Metadata" },
    { id: "strength", label: "Strength" },
    { id: "powerTests", label: "Power Tests" },
    { id: "running", label: "Running" },
    { id: "spatiotemporal", label: "Spatiotemporal" },
    { id: "kinematic", label: "Kinematic" },
    { id: "impact", label: "Impact" },
    { id: "variability", label: "Variability" },
    { id: "loadCarriage", label: "Load Carriage" },
  ];

  return (
    <div className="w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Biomechanics Assessment</h2>
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
        {activeTab === "metadata" && (
          <Metadata
            initialData={formData.metadata}
            onSave={(data) => handleSave("metadata", data)}
          />
        )}
        {activeTab === "strength" && (
          <Strength
            initialData={formData.strength}
            onSave={(data) => handleSave("strength", data)}
          />
        )}
        {activeTab === "powerTests" && (
          <PowerTests
            initialData={formData.powerTests}
            onSave={(data) => handleSave("powerTests", data)}
          />
        )}
        {activeTab === "running" && (
          <Running
            initialData={formData.running}
            onSave={(data) => handleSave("running", data)}
          />
        )}
        {activeTab === "spatiotemporal" && (
          <Spatiotemporal
            initialData={formData.spatiotemporal}
            onSave={(data) => handleSave("spatiotemporal", data)}
          />
        )}
        {activeTab === "kinematic" && (
          <Kinematic
            initialData={formData.kinematic}
            onSave={(data) => handleSave("kinematic", data)}
          />
        )}
        {activeTab === "impact" && (
          <Impact
            initialData={formData.impact}
            onSave={(data) => handleSave("impact", data)}
          />
        )}
        {activeTab === "variability" && (
          <Variability
            initialData={formData.variability}
            onSave={(data) => handleSave("variability", data)}
          />
        )}
        {activeTab === "loadCarriage" && (
          <LoadCarriage
            initialData={formData.loadCarriage}
            onSave={(data) => handleSave("loadCarriage", data)}
          />
        )}
      </div>
    </div>
  );
}

