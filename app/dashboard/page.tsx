"use client";

import { useState, useCallback, useEffect } from "react";
import OverviewPage from "./overview/page";
import EntriesPage from "./entries/page";
import DomainCard from "@/components/ui/DomainCard";
import ExportPage from "./export/ExportPage";
import PhysioFormTabs from "@/components/forms/physiotherapy/PhysioFormTabs";
import BiomechanicsFormTabs from "@/components/forms/biomechanics/BiomechanicsFormTabs";
import PhysiologyForm from "@/components/forms/physiology/PhysiologyForm";
import NutritionForm from "@/components/forms/nutrition/NutritionForm";
import PsychologyForm from "@/components/forms/psychology/PsychologyForm";
import { useDashboard } from "./layout";
import { db, auth } from "@/lib/firebase"; // Ensure auth is imported
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";

const DOMAIN_COLLECTION_MAP: Record<string, string> = {
  Physiotherapy: "physioAssessments",
  Physiology: "physioAssessments",
  Nutrition: "physioAssessments",
  Psychology: "physioAssessments",
  Biomechanics: "biomechanicsAssessments",
};

export default function DashboardPage() {
  const { activeTab, setActiveTab } = useDashboard();
  
  // State
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingEntryData, setEditingEntryData] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false); // Loading state for new entry

  // 1. NEW LOGIC: Create a Blank Shell Document immediately
  const handleCreateNewEntry = async () => {
    if (!auth.currentUser) {
      alert("Please log in to create an entry");
      return;
    }

    setIsCreating(true);
    try {
      // Create a skeleton document in the main collection
      const docRef = await addDoc(collection(db, "physioAssessments"), {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: auth.currentUser.uid,
        status: "in_progress",
        // Initialize statuses so Domain Cards show "Not Started"
        registrationDetails: {
            fullName: "New Patient", // Placeholder until filled
            dateOfAssessment: new Date().toISOString()
        },
        // You can add a helper to track status of sub-domains here if needed
      });

      console.log("Created new session:", docRef.id);

      // 2. Set the State to this NEW ID
      setEditingEntryId(docRef.id);
      
      // 3. Set Data to Empty/Default
      setEditingEntryData({
        registrationDetails: {},
        status: "in_progress"
      });

      // 4. Reset Domain Selection
      setSelectedDomain(null);

      // 5. Finally, Switch Tab
      setActiveTab("add");

    } catch (error) {
      console.error("Error creating new entry:", error);
      alert("Failed to initialize new entry");
    } finally {
      setIsCreating(false);
    }
  };

  const reloadDomainData = useCallback(async (domain: string, entryId: string) => {
    try {
      const collectionName = DOMAIN_COLLECTION_MAP[domain];
      if (!collectionName) return null;

      const docRef = doc(db, collectionName, entryId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
    } catch (error) {
      console.error("Error reloading domain data:", error);
    }
    return null;
  }, []);

  const hydrateAllDomainData = useCallback(async (entryId: string) => {
    const supportedDomains = Object.keys(DOMAIN_COLLECTION_MAP);
    
    const domainPayloads = await Promise.all(
      supportedDomains.map(async (domain) => {
        const data = await reloadDomainData(domain, entryId);
        return data;
      })
    );

    return domainPayloads.reduce((acc, data) => {
      if (data) {
        return { ...acc, ...data };
      }
      return acc;
    }, {} as Record<string, unknown>);
  }, [reloadDomainData]);

  const handleDomainSelect = async (domain: string) => {
    setSelectedDomain(domain);
    
    // If we have an ID, try to fetch latest data for this specific domain
    if (editingEntryId) {
        const freshData = await reloadDomainData(domain, editingEntryId);
        if (freshData) {
            // Merge fresh data with what we have
            setEditingEntryData((prev: any) => ({...prev, ...freshData}));
        }
    }
  };

  const handleBackFromForm = async () => {
    // When coming back from a specific form to the Domain Card view
    // We keep the editingEntryId so the session stays active
    setSelectedDomain(null);
  };

  const handleBackFromDomainSelect = () => {
    // When leaving the "Add/Edit" tab completely
    setSelectedDomain(null);
    setActiveTab("overview");
    // CRITICAL: Clear the ID so next time it doesn't show old data
    setEditingEntryId(null);
    setEditingEntryData(null);
  };

  const handleEditEntry = (id: string, data: any) => {
    console.log("Editing Existing Entry:", id);
    setEditingEntryId(id);
    setEditingEntryData(data);
    setSelectedDomain(null);
    setActiveTab("add");
  };

  useEffect(() => {
    if (!editingEntryId) return;

    let isCancelled = false;

    const preloadDomainData = async () => {
      const mergedData = await hydrateAllDomainData(editingEntryId);
      if (isCancelled || !mergedData) return;

      setEditingEntryData((prev: any) => ({
        ...(prev || {}),
        ...mergedData,
      }));
    };

    preloadDomainData();

    return () => {
      isCancelled = true;
    };
  }, [editingEntryId, hydrateAllDomainData]);

  // Handle data saved callback from form components
  const handleDataSaved = useCallback((domain: string, entryId: string, data: any) => {
    setEditingEntryId(entryId); // Ensure ID is synced
    setEditingEntryData((prev: any) => ({ ...prev, ...data }));
  }, []);

  return (
    <div className="w-full h-full overflow-x-hidden relative">
        
      {/* Loading Overlay during creation */}
      {isCreating && (
        <div className="absolute inset-0 z-50 bg-white/80 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Initializing New Assessment...</p>
            </div>
        </div>
      )}

      {/* TAB CONTROLLER */}
      {activeTab === "overview" && (
        <OverviewPage 
          onEdit={handleEditEntry}
        />
      )}
      
      {activeTab === "entries" && (
        <EntriesPage 
          // Connect the new Logic here
          onNewEntry={handleCreateNewEntry} 
          onEdit={handleEditEntry}
        />
      )}

      {activeTab === "add" && (
        <>
          {selectedDomain === null ? (
            <DomainCard
              // Force re-render when ID changes to update status badges
              key={editingEntryId || "new-domain-card"} 
              onBack={handleBackFromDomainSelect}
              onSelect={handleDomainSelect}
              entryData={editingEntryData}
            />
          ) : (
            /* FORM RENDERER */
            <>
              {selectedDomain === "Physiotherapy" && (
                <PhysioFormTabs 
                  // CRITICAL: The 'key' prop forces React to destroy the old form 
                  // and build a new one when the ID changes. This fixes "stuck data".
                  key={`physio-${editingEntryId}`} 
                  
                  onBack={handleBackFromForm}
                  initialData={editingEntryData}
                  entryId={editingEntryId}
                  onDataSaved={(id, data) => handleDataSaved("Physiotherapy", id, data)}
                />
              )}

              {selectedDomain === "Biomechanics" && (
                <BiomechanicsFormTabs
                  // CRITICAL: The 'key' prop
                  key={`biomech-${editingEntryId}`}

                  onBack={handleBackFromForm}
                  initialData={editingEntryData}
                  entryId={editingEntryId}
                  onDataSaved={(id, data) => handleDataSaved("Biomechanics", id, data)}
                />
              )}

              {selectedDomain === "Physiology" && (
                <PhysiologyForm
                  key={`physiology-${editingEntryId}`}
                  onBack={handleBackFromForm}
                  initialData={editingEntryData}
                  entryId={editingEntryId}
                  onDataSaved={(id, data) => handleDataSaved("Physiology", id, data)}
                />
              )}

              {selectedDomain === "Nutrition" && (
                <NutritionForm
                  key={`nutrition-${editingEntryId}`}
                  onBack={handleBackFromForm}
                  initialData={editingEntryData}
                  entryId={editingEntryId}
                  onDataSaved={(id, data) => handleDataSaved("Nutrition", id, data)}
                />
              )}

              {selectedDomain === "Psychology" && (
                <PsychologyForm
                  key={`psychology-${editingEntryId}`}
                  onBack={handleBackFromForm}
                  initialData={editingEntryData}
                  entryId={editingEntryId}
                  onDataSaved={(id, data) => handleDataSaved("Psychology", id, data)}
                />
              )}

              {/* Placeholder for other domains */}
              {!["Physiotherapy", "Biomechanics", "Physiology", "Nutrition", "Psychology"].includes(selectedDomain) && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedDomain} Assessment
                    </h2>
                    <button
                      onClick={handleBackFromForm}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      ← Back
                    </button>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                    <p className="text-gray-600">
                      {selectedDomain} form coming soon...
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
      
      {activeTab === "export" && <ExportPage />}
    </div>
  );
}