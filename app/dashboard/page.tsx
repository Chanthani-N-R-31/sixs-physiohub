// src/app/dashboard/page.tsx
"use client";

import { useState, useCallback } from "react";
import OverviewPage from "./overview/page";
import EntriesPage from "./entries/page";
import DomainCard from "@/components/ui/DomainCard";
import ExportPage from "./export/ExportPage";
import PhysioFormTabs from "@/components/forms/physiotherapy/PhysioFormTabs";
import BiomechanicsFormTabs from "@/components/forms/biomechanics/BiomechanicsFormTabs";
import { useDashboard } from "./layout";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function DashboardPage() {
  const { activeTab, setActiveTab } = useDashboard();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingEntryData, setEditingEntryData] = useState<any>(null);
  const [domainEntryIds, setDomainEntryIds] = useState<Record<string, string>>({});
  const [domainEntryData, setDomainEntryData] = useState<Record<string, any>>({});

  // Reload entry data from Firebase for a specific domain
  const reloadDomainData = useCallback(async (domain: string, entryId: string) => {
    try {
      let collectionName = "";
      if (domain === "Physiotherapy") {
        collectionName = "physioAssessments";
      } else if (domain === "Biomechanics") {
        collectionName = "biomechanicsAssessments";
      } else {
        return;
      }

      const docRef = doc(db, collectionName, entryId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDomainEntryIds((prev) => ({ ...prev, [domain]: entryId }));
        setDomainEntryData((prev) => ({ ...prev, [domain]: data }));
        return data;
      }
    } catch (error) {
      console.error("Error reloading domain data:", error);
    }
    return null;
  }, []);

  const handleDomainSelect = (domain: string) => {
    setSelectedDomain(domain);

    // Prefer domain-specific data if we've cached it, otherwise fall back to the last loaded entry data
    const domainEntryId = domainEntryIds[domain] || (domain === "Physiotherapy" ? editingEntryId : null);
    const domainData = domainEntryData[domain] || editingEntryData;

    setEditingEntryId(domainEntryId || null);
    setEditingEntryData(domainData || null);
  };

  const handleBackFromForm = async () => {
    // Reload data from Firebase before going back if we have an entryId
    if (selectedDomain && editingEntryId) {
      await reloadDomainData(selectedDomain, editingEntryId);
    }
    setSelectedDomain(null);
    // Keep editingEntryId and editingEntryData so DomainCard can show updated statuses
  };

  const handleBackFromDomainSelect = () => {
    setSelectedDomain(null);
    setActiveTab("overview");
    setEditingEntryId(null);
    setEditingEntryData(null);
  };

  const handleEditEntry = (id: string, data: any) => {
    setEditingEntryId(id);
    setEditingEntryData(data);
    // Show domain selection first so user can see statuses
    setSelectedDomain(null);
    setActiveTab("add");
    // Since entries currently list physiotherapy assessments, seed the domain cache
    setDomainEntryIds((prev) => ({ ...prev, Physiotherapy: id }));
    setDomainEntryData((prev) => ({ ...prev, Physiotherapy: data }));
  };

  // Handle data saved callback from form components
  const handleDataSaved = useCallback((domain: string, entryId: string, data: any) => {
    setEditingEntryId(entryId);
    setEditingEntryData((prev: any) => {
      // Merge with existing data to preserve other domains
      return { ...prev, ...data };
    });
    setDomainEntryIds((prev) => ({ ...prev, [domain]: entryId }));
    setDomainEntryData((prev) => ({ ...prev, [domain]: data }));
  }, []);

  const handleViewEntry = (data: any) => {
    // For now, just show an alert with key information
    const regDetails = data.registrationDetails || {};
    const name = regDetails.fullName || "Unknown";
    alert(`Viewing entry for: ${name}\n\nStatus: ${data.status || "N/A"}\n\nCheck console for full data.`);
    console.log("Full entry data:", data);
  };

  return (
    <div className="w-full h-full overflow-x-hidden">
      {/* TAB CONTROLLER */}
      {activeTab === "overview" && (
        <OverviewPage 
          onEdit={handleEditEntry}
          onView={handleViewEntry}
        />
      )}
      {activeTab === "entries" && (
        <EntriesPage 
          onNewEntry={() => setActiveTab("add")}
          onEdit={handleEditEntry}
          onView={handleViewEntry}
        />
      )}
      {activeTab === "add" && (
        <>
          {selectedDomain === null ? (
            <DomainCard
              onBack={handleBackFromDomainSelect}
              onSelect={handleDomainSelect}
              entryData={(() => {
                // Merge all domain data into a flat structure
                // domainEntryData is Record<string, any> where keys are domain names
                // We need to flatten it so entryData has direct access to fields like registrationDetails, metadata, etc.
                const merged: any = {};
                
                // First, merge data from all stored domains (most up-to-date)
                Object.values(domainEntryData).forEach((domainData: any) => {
                  if (domainData) {
                    Object.assign(merged, domainData);
                  }
                });
                
                // Then merge with editingEntryData (current session data)
                if (editingEntryData) {
                  Object.assign(merged, editingEntryData);
                }
                
                return merged;
              })()}
            />
          ) : selectedDomain === "Physiotherapy" ? (
            <PhysioFormTabs 
              onBack={handleBackFromForm}
              initialData={editingEntryData}
              entryId={editingEntryId}
              onDataSaved={(entryId, data) => handleDataSaved("Physiotherapy", entryId, data)}
            />
          ) : selectedDomain === "Biomechanics" ? (
            <BiomechanicsFormTabs
              onBack={handleBackFromForm}
              initialData={editingEntryData}
              entryId={editingEntryId}
              onDataSaved={(entryId, data) => handleDataSaved("Biomechanics", entryId, data)}
            />
          ) : (
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
      {activeTab === "export" && <ExportPage />}

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-md px-4 py-2 flex gap-4 lg:hidden border border-gray-200">
        <button
          onClick={() => setActiveTab("overview")}
          className={`p-2 ${
            activeTab === "overview" ? "text-green-600" : "text-gray-600"
          }`}
        >
          <i className="fas fa-home text-xl" />
        </button>

        <button
          onClick={() => setActiveTab("entries")}
          className={`p-2 ${
            activeTab === "entries" ? "text-green-600" : "text-gray-600"
          }`}
        >
          <i className="fas fa-table text-xl" />
        </button>

        <button
          onClick={() => setActiveTab("add")}
          className={`p-2 ${
            activeTab === "add" ? "text-green-600" : "text-gray-600"
          }`}
        >
          <i className="fas fa-plus-circle text-xl" />
        </button>

        <button
          onClick={() => setActiveTab("export")}
          className={`p-2 ${
            activeTab === "export" ? "text-green-600" : "text-gray-600"
          }`}
        >
          <i className="fas fa-download text-xl" />
        </button>
      </nav>
    </div>
  );
}
