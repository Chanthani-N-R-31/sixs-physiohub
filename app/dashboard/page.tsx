// src/app/dashboard/page.tsx
"use client";

import { useState } from "react";
import OverviewPage from "./overview/page";
import EntriesPage from "./entries/page";
import DomainCard from "@/components/ui/DomainCard";
import ExportPage from "./export/ExportPage";
import PhysioFormTabs from "@/components/forms/physiotherapy/PhysioFormTabs";
import BiomechanicsFormTabs from "@/components/forms/biomechanics/BiomechanicsFormTabs";
import { useDashboard } from "./layout";

export default function DashboardPage() {
  const { activeTab, setActiveTab } = useDashboard();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingEntryData, setEditingEntryData] = useState<any>(null);

  const handleDomainSelect = (domain: string) => {
    setSelectedDomain(domain);
    setEditingEntryId(null);
    setEditingEntryData(null);
  };

  const handleBackFromForm = () => {
    setSelectedDomain(null);
    setEditingEntryId(null);
    setEditingEntryData(null);
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
    setSelectedDomain("Physiotherapy");
    setActiveTab("add");
  };

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
            />
          ) : selectedDomain === "Physiotherapy" ? (
            <PhysioFormTabs 
              onBack={handleBackFromForm}
              initialData={editingEntryData}
              entryId={editingEntryId}
            />
          ) : selectedDomain === "Biomechanics" ? (
            <BiomechanicsFormTabs
              onBack={handleBackFromForm}
              initialData={editingEntryData}
              entryId={editingEntryId}
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
