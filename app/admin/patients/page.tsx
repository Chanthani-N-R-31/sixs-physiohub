"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { logActivity } from "@/lib/auditLogger";
import DomainCard from "@/components/ui/DomainCard";
import PhysioFormTabs from "@/components/forms/physiotherapy/PhysioFormTabs";
import BiomechanicsFormTabs from "@/components/forms/biomechanics/BiomechanicsFormTabs";
import PhysiologyForm from "@/components/forms/physiology/PhysiologyForm";
import NutritionForm from "@/components/forms/nutrition/NutritionForm";
import PsychologyForm from "@/components/forms/psychology/PsychologyForm";

const DOMAIN_COLLECTION_MAP: Record<string, string> = {
  Physiotherapy: "physioAssessments",
  Physiology: "physioAssessments",
  Nutrition: "physioAssessments",
  Psychology: "physioAssessments",
  Biomechanics: "biomechanicsAssessments",
};

interface Individual {
  id: string;
  fullId: string;
  name: string;
  unit: string;
  rank: string;
  physio: string;
  lastActivity: string;
  status: string;
  fullData?: any;
}

export default function MasterIndividualIndex() {
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Edit mode state (same as dashboard)
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingEntryData, setEditingEntryData] = useState<any>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  useEffect(() => {
    loadIndividuals();
  }, []);

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
  }, [editingEntryId]);

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

  const loadIndividuals = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "physioAssessments"), orderBy("updatedAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const loadedIndividuals: Individual[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const regDetails = data.registrationDetails || {};
        
        // Get full name
        let fullName = regDetails.fullName || "";
        if (!fullName) {
          const parts = [
            regDetails.firstName,
            regDetails.initials,
            regDetails.lastName
          ].filter(Boolean);
          fullName = parts.join(" ").trim() || "Unknown Individual";
        }

        // Get unit/rank
        const unit = regDetails.unit || regDetails.unitName || "N/A";
        const rank = regDetails.rank || regDetails.rankName || "N/A";

        // Get physio name (from createdBy or assignedPhysio)
        const physio = regDetails.assignedPhysio || data.createdBy || "N/A";

        // Get last activity date
        let lastActivity = regDetails.dateOfAssessment || "";
        if (!lastActivity && data.updatedAt) {
          const timestamp = data.updatedAt.toDate ? data.updatedAt.toDate() : null;
          if (timestamp) {
            lastActivity = timestamp.toLocaleDateString();
          }
        }
        if (!lastActivity) lastActivity = "N/A";

        // Status
        const statusRaw = data.status || "incomplete";
        const status = statusRaw === "completed" ? "Completed" : 
                      statusRaw === "in_progress" ? "In Progress" : "Incomplete";

        loadedIndividuals.push({
          id: `P-${docSnapshot.id.slice(0, 6)}`,
          fullId: docSnapshot.id,
          name: fullName,
          unit: unit,
          rank: rank,
          physio: physio,
          lastActivity: lastActivity,
          status: status,
          fullData: { id: docSnapshot.id, ...data },
        });
      });
      
      setIndividuals(loadedIndividuals);
    } catch (error) {
      console.error("Error loading individuals:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIndividuals = individuals.filter((ind) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      ind.name.toLowerCase().includes(search) ||
      ind.id.toLowerCase().includes(search) ||
      ind.unit.toLowerCase().includes(search) ||
      ind.rank.toLowerCase().includes(search)
    );
  });

  const handleCreateNew = () => {
    // Start a brand new assessment flow (same as main dashboard):
    // immediately open Physiotherapy → Registration Details first,
    // then allow moving on to other forms/domains.
    setIsCreatingNew(true);
    setEditingEntryId(null);
    setEditingEntryData({
      registrationDetails: {},
      status: "in_progress",
    });
    setSelectedDomain("Physiotherapy");
  };

  const handleEdit = async (individual: Individual) => {
    try {
      let entryData = individual.fullData;
      
      // Fetch full data if not available
      if (!entryData) {
        const docRef = doc(db, "physioAssessments", individual.fullId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          entryData = { id: docSnap.id, ...docSnap.data() };
        } else {
          alert("Entry not found. Please try again.");
          return;
        }
      }

      // Set edit mode (same as dashboard)
      setEditingEntryId(individual.fullId);
      setEditingEntryData(entryData);
      setSelectedDomain(null);
    } catch (error) {
      console.error("Error loading entry for edit:", error);
      alert("Error loading entry for editing. Please try again.");
    }
  };

  const handleDelete = async (individual: Individual) => {
    if (!confirm(`Are you sure you want to delete the entry for ${individual.name}?`)) {
      return;
    }
    
    try {
      // Ensure we have the latest full data before deleting
      let entryData = individual.fullData;
      if (!entryData) {
        const docRef = doc(db, "physioAssessments", individual.fullId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          entryData = { id: docSnap.id, ...docSnap.data() };
        } else {
          alert("Entry not found. It may have already been deleted.");
          return;
        }
      }

      // 1) Move the document to an archive collection for potential restore
      await setDoc(doc(db, "deletedPhysioAssessments", individual.fullId), entryData);

      // 2) Delete from the main collection
      await deleteDoc(doc(db, "physioAssessments", individual.fullId));
      
      // Log the deletion activity
      const userName = auth.currentUser?.email || auth.currentUser?.displayName || "Admin";
      const userId = auth.currentUser?.uid || "unknown";
      await logActivity(
        userId,
        userName,
        "DELETED",
        // Include the underlying Firestore document ID so Governance can restore it
        `Deleted individual ${individual.id} (${individual.name}) [docId=${individual.fullId}]`
      );
      
      // Remove from local state
      setIndividuals((prev) => prev.filter((ind) => ind.fullId !== individual.fullId));
      
      // Reload to refresh the list
      await loadIndividuals();
      
      // Show success message
      alert(`Entry for ${individual.name} has been deleted successfully.`);
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Error deleting entry. Please try again.");
    }
  };

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
    setSelectedDomain(null);
  };

  const handleBackFromEdit = () => {
    // When leaving edit mode completely
    setSelectedDomain(null);
    setEditingEntryId(null);
    setEditingEntryData(null);
    setIsCreatingNew(false);
  };

  const handleDataSaved = useCallback((domain: string, entryId: string, data: any) => {
    setEditingEntryId(entryId); // Ensure ID is synced
    setEditingEntryData((prev: any) => ({ ...prev, ...data }));
    // Reload individuals list to reflect changes
    loadIndividuals();
  }, []);

  // If in edit/create mode, show the form interface (same as dashboard)
  if (editingEntryId || isCreatingNew) {
    return (
      <div className="space-y-6">
        {/* Back button */}
        <button
          onClick={handleBackFromEdit}
          className="flex items-center gap-2 text-black hover:text-black font-bold mb-4 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Individual Index</span>
        </button>

        {/* Show the DomainCard whenever no specific domain is selected.
            This lets admins choose ANY domain (Physiotherapy, Physiology,
            Biomechanics, Nutrition, Psychology) for both new and existing
            entries. Registration locking is handled inside DomainCard. */}
        {selectedDomain === null ? (
          <DomainCard
            key={editingEntryId || "new-domain-card"}
            onBack={handleBackFromEdit}
            onSelect={handleDomainSelect}
            entryData={editingEntryData}
          />
        ) : (
          <>
            {selectedDomain === "Physiotherapy" && (
              <PhysioFormTabs 
                key={`physio-${editingEntryId || "new"}`}
                onBack={handleBackFromForm}
                initialData={editingEntryData}
                entryId={editingEntryId}
                onDataSaved={(id, data) => handleDataSaved("Physiotherapy", id, data)}
              />
            )}

            {selectedDomain === "Biomechanics" && (
              <BiomechanicsFormTabs
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
          </>
        )}
      </div>
    );
  }

  // Normal list view
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">
          Master Individual Index (MII)
        </h2>
        <p className="text-white/70 mt-1 font-medium">
          Global search across all physiotherapy domains and users.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Individual Name, ID, or Army Number..."
              className="w-full pl-10 p-3 bg-white border border-gray-400 rounded-lg text-black font-bold placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-gray-300 border border-gray-400 rounded-lg text-black font-bold hover:bg-gray-400 transition-all shadow-lg">
            <FunnelIcon className="w-5 h-5" />
            Filters
          </button>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-300 text-black font-bold rounded-lg hover:bg-gray-400 transition-all shadow-lg"
        >
          <PlusCircleIcon className="w-5 h-5" />
          Add New Entry
        </button>
      </div>

      {/* Data Table - Light grey card */}
      <div className="bg-gray-100 rounded-xl p-6 shadow-lg border border-gray-400 overflow-hidden">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="border-b border-gray-400">
              <tr>
                <th className="p-4 text-black font-bold">Individual ID</th>
                <th className="p-4 text-black font-bold">Name</th>
                <th className="p-4 text-black font-bold">Unit / Rank</th>
                <th className="p-4 text-black font-bold">Physio</th>
                <th className="p-4 text-black font-bold">Last Activity</th>
                <th className="p-4 text-black font-bold">Status</th>
                <th className="p-4 text-black font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-400">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-gray-500"
                  >
                    Loading individuals...
                  </td>
                </tr>
              ) : filteredIndividuals.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-gray-500"
                  >
                    No individuals found.
                  </td>
                </tr>
              ) : (
                filteredIndividuals.map((ind) => (
                  <tr
                    key={ind.fullId}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 font-mono text-black font-bold">
                      {ind.id}
                    </td>
                    <td className="p-4 font-bold text-black">{ind.name}</td>
                    <td className="p-4 text-black">
                      {ind.rank} / {ind.unit}
                    </td>
                    <td className="p-4 text-black">{ind.physio}</td>
                    <td className="p-4 text-black">
                      {ind.lastActivity}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ind.status === "Completed" 
                          ? "bg-teal-600 text-white border border-teal-500"
                          : ind.status === "In Progress"
                          ? "bg-teal-600 text-white border border-teal-500"
                          : "bg-gray-400 text-white border border-gray-500"
                      }`}>
                        {ind.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          title="Edit"
                          onClick={() => handleEdit(ind)}
                          className="p-2 rounded-md text-black hover:bg-gray-300 hover:text-black transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => handleDelete(ind)}
                          className="p-2 rounded-md text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Placeholder */}
      <div className="flex justify-center text-sm text-gray-600 font-medium">
        Showing {filteredIndividuals.length} of {individuals.length} records
      </div>
    </div>
  );
}

