"use client";

import { useState, useCallback, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDoc, setDoc } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { calculateDomainStatus, getDomainStatuses, calculateGlobalStatus } from "@/lib/domainStatus";

// Import your sections
import Metadata from "./sections/Metadata";
import Running from "./sections/Running";
import Spatiotemporal from "./sections/Spatiotemporal";
import Kinematic from "./sections/Kinematic";
import Impact from "./sections/Impact";
import Variability from "./sections/Variability";
import LoadCarriage from "./sections/LoadCarriage";
import Strength from "./sections/Strength";
import PowerTests from "./sections/PowerTests";

interface BiomechanicsFormTabsProps {
  onBack?: () => void;
  initialData?: any;
  entryId?: string | null;
  onDataSaved?: (entryId: string, data: any) => void;
}

export default function BiomechanicsFormTabs({ onBack, initialData, entryId, onDataSaved }: BiomechanicsFormTabsProps) {
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

  // --- HELPER: Cleans data to remove 'undefined' which crashes Firestore ---
  const cleanData = (data: any) => {
    // JSON stringify/parse removes all keys with 'undefined' values
    return JSON.parse(JSON.stringify(data));
  };

  const handleSave = useCallback(async (section: string, data: any) => {
    // 1. Check Auth
    if (!auth.currentUser) {
      alert("You must be logged in to save data. Please refresh or log in again.");
      return;
    }

    setSaving(true);
    try {
      // 2. Update Local State
      const updatedFormData = { ...formData, [section]: data };
      setFormData(updatedFormData);

      // 3. Prepare Data for Firestore (Clean 'undefined' values)
      const dataToSave = cleanData({
        ...updatedFormData,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser.uid,
      });

      // 4. Save to Biomechanics Collection
      let finalEntryId = entryIdState;
      if (entryIdState) {
        // UPDATE Existing
        const docRef = doc(db, "biomechanicsAssessments", entryIdState);
        await setDoc(docRef, dataToSave, { merge: true });
        console.log("Updated biomechanics document:", entryIdState);
      } else {
        // CREATE New (this shouldn't happen in normal flow, but handle it)
        const newDocPayload = {
          ...dataToSave,
          createdAt: serverTimestamp(),
          createdBy: auth.currentUser.uid,
          status: "in_progress",
        };
        
        const docRef = await addDoc(collection(db, "biomechanicsAssessments"), newDocPayload);
        finalEntryId = docRef.id;
        setEntryIdState(docRef.id);
        console.log("Created new biomechanics document:", docRef.id);
      }

      // 5. Update domain statuses in main physioAssessments document
      // The entryIdState should be the same as the main patient document ID
      if (entryIdState) {
        try {
          const physioDocRef = doc(db, "physioAssessments", entryIdState);
          
          // Get existing physioAssessments document
          let existingPhysioData: any = null;
          try {
            const physioDocSnap = await getDoc(physioDocRef);
            if (physioDocSnap.exists()) {
              existingPhysioData = physioDocSnap.data();
            }
          } catch (err) {
            console.warn("Could not fetch physioAssessments document:", err);
          }
          
          // Calculate Biomechanics domain status from biomechanics data directly
          // Biomechanics schema expects fields at root level (metadata, running, etc.)
          const biomechanicsData = updatedFormData;
          const domainStatus = calculateDomainStatus("Biomechanics", biomechanicsData);
          
          // For calculating other domain statuses, we need the physioAssessments data
          // Merge biomechanics fields into the physio data for complete picture
          const allDomainData = existingPhysioData 
            ? { ...existingPhysioData, ...updatedFormData }
            : { ...updatedFormData };
          
          // Get existing domain statuses or calculate from all data
          const existingDomainStatuses = existingPhysioData?.domainStatuses;
          let updatedDomainStatuses: any;
          
          if (existingDomainStatuses) {
            updatedDomainStatuses = {
              ...existingDomainStatuses,
              Biomechanics: domainStatus
            };
          } else {
            updatedDomainStatuses = getDomainStatuses(allDomainData);
            updatedDomainStatuses.Biomechanics = domainStatus;
          }
          
          // Calculate overall patient status
          const patientStatus = calculateGlobalStatus(updatedDomainStatuses);
          
          // Update physioAssessments document with domain statuses
          await updateDoc(physioDocRef, {
            domainStatuses: updatedDomainStatuses,
            status: patientStatus,
            updatedAt: serverTimestamp(),
          });
        } catch (error: any) {
          console.warn("Could not update physioAssessments domain statuses:", error);
          // Don't fail the save if this fails - biomechanics data is already saved
        }
      }

      // 6. Notify parent component of the save
      if (onDataSaved && finalEntryId) {
        onDataSaved(finalEntryId, updatedFormData);
      }

    } catch (error: any) {
      // Detailed Error Logging
      console.error("FIREBASE SAVE ERROR:", error);
      console.error("Error Code:", error.code);
      console.error("Error Message:", error.message);
      
      let errorMessage = "Error saving data.";
      if (error.message.includes("undefined")) {
        errorMessage = "Error: Data contained undefined values. Check the console.";
      } else if (error.code === "permission-denied") {
        errorMessage = "Permission denied. Check your Firestore rules.";
      }
      
      alert(errorMessage);
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
        <div>
            <h2 className="text-3xl font-bold text-white">Biomechanics Assessment</h2>
            {/* Debugging ID display */}
            <p className="text-xs text-white/60 mt-1 font-medium">
                ID: {entryIdState ? entryIdState : "New Entry (Not Saved Yet)"}
            </p>
        </div>
        
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-lg font-bold hover:bg-white/20 transition-all shadow-lg border border-white/30"
          >
            ← Back
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-white/30 mb-6">
        <div className="flex space-x-1 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-green-500 text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/30 relative">
        {/* Saving Overlay */}
        {saving && (
            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                <span className="bg-[#1a4d4d]/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold border border-[#1a4d4d]/50">Saving...</span>
            </div>
        )}

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