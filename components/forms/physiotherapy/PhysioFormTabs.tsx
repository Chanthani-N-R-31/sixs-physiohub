"use client";

import { useState, useCallback, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { calculateDomainStatus, getDomainStatuses, calculateGlobalStatus } from "@/lib/domainStatus";

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
  onDataSaved?: (entryId: string, data: any) => void;
}

export default function PhysioFormTabs({ onBack, initialData, entryId, onDataSaved }: PhysioFormTabsProps) {
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

      let finalEntryId = patientId;
      
      // Get existing document to merge all domain data
      let existingData: any = null;
      if (patientId) {
        try {
          const docSnap = await getDoc(doc(db, "physioAssessments", patientId));
          if (docSnap.exists()) {
            existingData = docSnap.data();
          }
        } catch (err) {
          console.warn("Could not fetch existing document:", err);
        }
      }
      
      // Merge updated Physiotherapy data with existing data (including other domains)
      const allDomainData = existingData 
        ? { ...existingData, ...updatedData }
        : { ...updatedData };
      
      // Calculate Physiotherapy domain status
      const domainStatus = calculateDomainStatus("Physiotherapy", allDomainData);
      
      // Get existing domain statuses or calculate from all data
      const existingDomainStatuses = existingData?.domainStatuses;
      let updatedDomainStatuses: any;
      
      if (existingDomainStatuses) {
        updatedDomainStatuses = {
          ...existingDomainStatuses,
          Physiotherapy: domainStatus
        };
      } else {
        updatedDomainStatuses = getDomainStatuses(allDomainData);
        updatedDomainStatuses.Physiotherapy = domainStatus;
      }
      
      // Calculate overall patient status
      const patientStatus = calculateGlobalStatus(updatedDomainStatuses);
      
      if (patientId) {
        // Update existing document
        await updateDoc(doc(db, "physioAssessments", patientId), {
          ...updatedData,
          domainStatuses: updatedDomainStatuses,
          status: patientStatus,
          updatedAt: serverTimestamp(),
          updatedBy: auth.currentUser.uid,
        });
      } else {
        // Create new document
        const docRef = await addDoc(collection(db, "physioAssessments"), {
          ...updatedData,
          domainStatuses: updatedDomainStatuses,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: auth.currentUser.uid,
          updatedBy: auth.currentUser.uid,
          status: patientStatus,
        });
        finalEntryId = docRef.id;
        setPatientId(docRef.id);
      }

      // Notify parent component of the save
      if (onDataSaved && finalEntryId) {
        onDataSaved(finalEntryId, updatedData);
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
        <h2 className="text-3xl font-bold text-white">Physiotherapy Assessment</h2>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 transition-all shadow-lg border border-gray-600"
          >
            ← Back
          </button>
        )}
      </div>

      {/* Tabs */}
          <div className="border-b border-gray-700 mb-6">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-bold whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-b-2 border-blue-500 text-white font-bold"
                  : "text-white font-bold hover:text-white hover:bg-gray-700/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
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

