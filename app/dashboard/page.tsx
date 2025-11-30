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
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";

// Map domains to their specific Firestore collections
const DOMAIN_COLLECTION_MAP: Record<string, string> = {
  Physiotherapy: "physioAssessments",
  Physiology: "physioAssessments", // Assuming shared collection
  Nutrition: "physioAssessments", // Assuming shared collection
  Psychology: "physioAssessments", // Assuming shared collection
  Biomechanics: "biomechanicsAssessments",
};

export default function DashboardPage() {
  const { activeTab, setActiveTab } = useDashboard();

  // State
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingEntryData, setEditingEntryData] = useState<any>(null);
  
  // Loading States
  const [isCreating, setIsCreating] = useState(false); // Creating new entry
  const [isDataLoading, setIsDataLoading] = useState(false); // Fetching existing data (Fix for glitch)

  // --- 1. Create New Entry Logic ---
  const handleCreateNewEntry = async () => {
    if (!auth.currentUser) {
      alert("Please log in to create an entry");
      return;
    }

    setIsCreating(true);
    try {
      const docRef = await addDoc(collection(db, "physioAssessments"), {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: auth.currentUser.uid,
        status: "in_progress",
        registrationDetails: {
          fullName: "New Patient",
          dateOfAssessment: new Date().toISOString(),
        },
      });

      setEditingEntryId(docRef.id);
      setEditingEntryData({
        registrationDetails: {},
        status: "in_progress",
      });
      setSelectedDomain(null);
      setActiveTab("add");
    } catch (error) {
      console.error("Error creating new entry:", error);
      alert("Failed to initialize new entry");
    } finally {
      setIsCreating(false);
    }
  };

  // --- 2. Data Fetching Logic ---
  const reloadDomainData = useCallback(
    async (domain: string, entryId: string) => {
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
    },
    []
  );

  const hydrateAllDomainData = useCallback(
    async (entryId: string) => {
      const supportedDomains = Object.keys(DOMAIN_COLLECTION_MAP);

      // Fetch all domains in parallel
      const domainPayloads = await Promise.all(
        supportedDomains.map(async (domain) => {
          const data = await reloadDomainData(domain, entryId);
          return data;
        })
      );

      // Merge all results into one object
      return domainPayloads.reduce((acc, data) => {
        if (data) {
          return { ...acc, ...data };
        }
        return acc;
      }, {} as Record<string, unknown>);
    },
    [reloadDomainData]
  );

  // --- 3. Navigation & Selection Handlers ---
  const handleDomainSelect = async (domain: string) => {
    setSelectedDomain(domain);

    // Optional: Re-fetch latest data for just this domain to be safe
    if (editingEntryId) {
      const freshData = await reloadDomainData(domain, editingEntryId);
      if (freshData) {
        setEditingEntryData((prev: any) => ({ ...prev, ...freshData }));
      }
    }
  };

  const handleBackFromForm = async () => {
    setSelectedDomain(null);
    // When coming back to the card view, re-hydrate to ensure statuses update immediately
    if (editingEntryId) {
        const mergedData = await hydrateAllDomainData(editingEntryId);
        setEditingEntryData((prev: any) => ({ ...prev, ...mergedData }));
    }
  };

  const handleBackFromDomainSelect = () => {
    setSelectedDomain(null);
    setActiveTab("overview");
    setEditingEntryId(null);
    setEditingEntryData(null);
  };

  const handleEditEntry = (id: string, initialData: any) => {
    console.log("Editing Entry:", id);
    setEditingEntryId(id);
    
    // Don't set data yet, or set what we have but trigger loading
    // This prevents the UI from showing "Not Started" while it fetches the rest
    setIsDataLoading(true); 
    
    setSelectedDomain(null);
    setActiveTab("add");
  };

  // --- 4. Effect to Load Full Data on Edit ---
  useEffect(() => {
    if (!editingEntryId) return;

    let isCancelled = false;

    const loadFullData = async () => {
      // We might already have some data from the table row (initialData)
      // But we need to fetch the *rest* of the domains (Biomechanics, etc.)
      
      const mergedData = await hydrateAllDomainData(editingEntryId);
      
      if (!isCancelled) {
        setEditingEntryData((prev: any) => ({
          ...(prev || {}),
          ...mergedData,
        }));
        setIsDataLoading(false); // DATA IS READY, UNBLOCK UI
      }
    };

    loadFullData();

    return () => {
      isCancelled = true;
    };
  }, [editingEntryId, hydrateAllDomainData]);

  // --- 5. Save Handler ---
  const handleDataSaved = useCallback(
    (domain: string, entryId: string, data: any) => {
      setEditingEntryId(entryId);
      setEditingEntryData((prev: any) => ({ ...prev, ...data }));
    },
    []
  );

  return (
    <div className="w-full h-full overflow-x-hidden relative">
      
      {/* LOADING OVERLAY (For Creation) */}
      {isCreating && (
        <div className="absolute inset-0 z-50 bg-white/90 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Initializing New Assessment...</p>
          </div>
        </div>
      )}

      {/* LOADING OVERLAY (For Fetching Existing Data) - FIXES THE GLITCH */}
      {isDataLoading && activeTab === "add" && (
        <div className="absolute inset-0 z-50 bg-white/90 flex items-center justify-center">
          <div className="text-center">
             {/* Using a different color/style to distinguish update load vs create load */}
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading Assessment Data...</p>
          </div>
        </div>
      )}

      {/* TAB CONTENT */}
      {activeTab === "overview" && (
        <OverviewPage onEdit={handleEditEntry} />
      )}

      {activeTab === "entries" && (
        <EntriesPage
          onNewEntry={handleCreateNewEntry}
          onEdit={handleEditEntry}
        />
      )}

      {activeTab === "add" && (
        <>
          {/* Only render the Domain Card if we are NOT loading data */}
          {!isDataLoading && selectedDomain === null ? (
            <DomainCard
              key={editingEntryId || "new-card"}
              onBack={handleBackFromDomainSelect}
              onSelect={handleDomainSelect}
              entryData={editingEntryData}
            />
          ) : !isDataLoading ? (
            /* FORM RENDERER */
            <>
              {selectedDomain === "Physiotherapy" && (
                <PhysioFormTabs
                  key={`physio-${editingEntryId}`}
                  onBack={handleBackFromForm}
                  initialData={editingEntryData}
                  entryId={editingEntryId}
                  onDataSaved={(id, data) =>
                    handleDataSaved("Physiotherapy", id, data)
                  }
                />
              )}

              {selectedDomain === "Biomechanics" && (
                <BiomechanicsFormTabs
                  key={`biomech-${editingEntryId}`}
                  onBack={handleBackFromForm}
                  initialData={editingEntryData}
                  entryId={editingEntryId}
                  onDataSaved={(id, data) =>
                    handleDataSaved("Biomechanics", id, data)
                  }
                />
              )}

              {selectedDomain === "Physiology" && (
                <PhysiologyForm
                  key={`physiology-${editingEntryId}`}
                  onBack={handleBackFromForm}
                  initialData={editingEntryData}
                  entryId={editingEntryId}
                  onDataSaved={(id, data) =>
                    handleDataSaved("Physiology", id, data)
                  }
                />
              )}

              {selectedDomain === "Nutrition" && (
                <NutritionForm
                  key={`nutrition-${editingEntryId}`}
                  onBack={handleBackFromForm}
                  initialData={editingEntryData}
                  entryId={editingEntryId}
                  onDataSaved={(id, data) =>
                    handleDataSaved("Nutrition", id, data)
                  }
                />
              )}

              {selectedDomain === "Psychology" && (
                <PsychologyForm
                  key={`psychology-${editingEntryId}`}
                  onBack={handleBackFromForm}
                  initialData={editingEntryData}
                  entryId={editingEntryId}
                  onDataSaved={(id, data) =>
                    handleDataSaved("Psychology", id, data)
                  }
                />
              )}

              {/* Placeholder for unknown domains */}
              {!["Physiotherapy", "Biomechanics", "Physiology", "Nutrition", "Psychology"].includes(selectedDomain || "") && (
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
          ) : null}
        </>
      )}

      {activeTab === "export" && <ExportPage />}

      {/* MOBILE BOTTOM NAV (UNCHANGED) */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-md px-4 py-2 flex gap-4 lg:hidden border border-gray-200 z-50">
        <button
          onClick={() => setActiveTab("overview")}
          className={`p-2 ${activeTab === "overview" ? "text-green-600" : "text-gray-600"}`}
        >
           {/* Icons handled by your existing code */}
           <i className="fas fa-home text-xl" />
        </button>
        <button
          onClick={() => setActiveTab("entries")}
          className={`p-2 ${activeTab === "entries" ? "text-green-600" : "text-gray-600"}`}
        >
           <i className="fas fa-table text-xl" />
        </button>
        <button
          onClick={() => setActiveTab("add")}
          className={`p-2 ${activeTab === "add" ? "text-green-600" : "text-gray-600"}`}
        >
           <i className="fas fa-plus-circle text-xl" />
        </button>
        <button
          onClick={() => setActiveTab("export")}
          className={`p-2 ${activeTab === "export" ? "text-green-600" : "text-gray-600"}`}
        >
           <i className="fas fa-download text-xl" />
        </button>
      </nav>
    </div>
  );
}