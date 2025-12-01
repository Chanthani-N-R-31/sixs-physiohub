"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, getDoc, doc, query, orderBy, onSnapshot } from "firebase/firestore";
import {
  loadAllAssessmentData,
  exportPhysiotherapyToCSV,
  downloadPhysiotherapyReport,
} from "@/lib/exportData";
import GlassCard from "@/components/ui/GlassCard";

interface Patient {
  id: string;
  name: string;
  domain?: string;
}

export default function ExportPage() {
  const [selectedPatient, setSelectedPatient] = useState("");
  const [domainFilter, setDomainFilter] = useState<"all" | "specific">("all");
  const [specificDomain, setSpecificDomain] = useState("Physiotherapy");
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx">("csv");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "physioAssessments"), orderBy("updatedAt", "desc"));
    setLoading(true);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedPatients: Patient[] = [];
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          const regDetails = data.registrationDetails || {};

          let fullName = regDetails.fullName || "";
          if (!fullName) {
            const parts = [regDetails.firstName, regDetails.initials, regDetails.lastName].filter(Boolean);
            fullName = parts.join(" ").trim() || "Unknown Individual";
          }

          loadedPatients.push({
            id: docSnapshot.id,
            name: fullName,
          });
        });

        setPatients(loadedPatients);
        setLoading(false);
      },
      (error) => {
        console.error("Realtime update failed:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // --- HANDLE DOWNLOAD ---
  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      let rawData: any[] = [];
      
      // Load data based on filters
      if (selectedPatient) {
        rawData = await loadAllAssessmentData(selectedPatient);
        
        if (domainFilter === "specific" && specificDomain !== "Physiotherapy") {
          alert("Structured export currently supports Physiotherapy domain only. Please select 'All Domains' or 'Physiotherapy'.");
          setIsGenerating(false);
          return;
        }
      } else {
        rawData = await loadAllAssessmentData();
        
        if (domainFilter === "specific" && specificDomain !== "Physiotherapy") {
          alert("Structured export currently supports Physiotherapy domain only. Please select 'All Domains' or 'Physiotherapy'.");
          setIsGenerating(false);
          return;
        }
      }

      if (rawData.length === 0) {
        alert("No data found to export.");
        setIsGenerating(false);
        return;
      }

      // Use the new structured export function for Physiotherapy
      const csvString = exportPhysiotherapyToCSV(rawData, "physiotherapy_report");
      
      if (!csvString) {
        alert("No physiotherapy data found to export.");
        setIsGenerating(false);
        return;
      }
      
      // Determine filename
      let filename = "physiotherapy_report";
      if (selectedPatient) {
        const patient = patients.find(p => p.id === selectedPatient);
        filename = patient 
          ? `physiotherapy_report_${patient.name.replace(/\s+/g, "_")}` 
          : "physiotherapy_report";
      }
      
      // Download the clean, structured report
      downloadPhysiotherapyReport(csvString, filename);
      
      const physioCount = rawData.filter(d => d._domain === 'Physiotherapy' || !d._domain).length;
      alert(`Export completed! ${physioCount} record(s) exported.`);
      
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please check the console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* Header */}
      <h2 className="text-3xl font-bold text-white mb-6">Export Data</h2>

      {/* Card */}
      <GlassCard>
        {/* Patient Dropdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-white mb-1">
              Select Individuals
            </label>

            <div className="flex gap-2">
              <select
                className="w-full p-3 bg-white/20 backdrop-blur-md border border-white/40 rounded-lg text-white font-bold placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 shadow-lg"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                disabled={loading || isGenerating}
              >
                <option value="" className="bg-white/20 text-gray-900">All</option>
                {loading ? (
                  <option disabled className="bg-white/20 text-gray-900">Loading patients...</option>
                ) : patients.length === 0 ? (
                  <option disabled className="bg-white/20 text-gray-900">No entries found</option>
                ) : (
                  patients.map((p) => (
                    <option key={p.id} value={p.id} className="bg-white/20 text-gray-900">
                      {p.name} (P-{p.id.slice(0, 6)}) {p.domain ? `- ${p.domain}` : ""}
                    </option>
                  ))
                )}
              </select>
              <button
                onClick={() => window.location.reload()}
                disabled={loading || isGenerating}
                className="px-4 py-3 bg-white/10 backdrop-blur-md text-white rounded-lg font-bold hover:bg-white/20 transition-all shadow-lg border border-white/30 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh patient list"
              >
                ↻
              </button>
            </div>
          </div>

          {/* Domain Choice */}
          <div>
            <label className="block text-sm font-bold text-white mb-1">
              Domain
            </label>

            <div className="flex flex-wrap gap-4 mt-2">
              <label className="flex items-center gap-2 text-sm text-white font-medium">
                <input
                  type="radio"
                  name="domain"
                  checked={domainFilter === "all"}
                  onChange={() => setDomainFilter("all")}
                  disabled={isGenerating}
                  className="accent-[#1a4d4d]"
                />
                All Domains
              </label>

              <label className="flex items-center gap-2 text-sm text-white font-medium">
                <input
                  type="radio"
                  name="domain"
                  checked={domainFilter === "specific"}
                  onChange={() => setDomainFilter("specific")}
                  disabled={isGenerating}
                  className="accent-[#1a4d4d]"
                />
                Specific Domain
              </label>

              {domainFilter === "specific" && (
                <select
                  className="p-2 bg-white/20 backdrop-blur-md border border-white/40 rounded-lg text-white font-bold focus:outline-none focus:ring-2 focus:ring-white/50"
                  value={specificDomain}
                  onChange={(e) => setSpecificDomain(e.target.value)}
                  disabled={isGenerating}
                >
                  <option className="bg-white/20 text-gray-900">Physiotherapy</option>
                  <option className="bg-white/20 text-gray-900">Biomechanics</option>
                  <option className="bg-white/20 text-gray-900">Physiology</option>
                  <option className="bg-white/20 text-gray-900">Nutrition</option>
                  <option className="bg-white/20 text-gray-900">Psychology</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Format Selector */}
        <div className="mt-8">
          <label className="block text-sm font-bold text-white mb-2">
            Export Format
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setExportFormat("csv")}
              disabled={isGenerating}
              className={`p-6 rounded-xl border transition ${
                exportFormat === "csv"
                  ? "border-[#1a4d4d]/80 bg-[#1a4d4d]/30 backdrop-blur-sm"
                  : "border-white/30 bg-white/5 hover:bg-white/10"
              } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="text-lg font-bold text-white">CSV</div>
              <div className="text-sm text-white/70 mt-1">
                Comma-Separated Values
              </div>
            </button>

            <button
              onClick={() => setExportFormat("xlsx")}
              disabled={isGenerating}
              className={`p-6 rounded-xl border transition ${
                exportFormat === "xlsx"
                  ? "border-[#1a4d4d]/80 bg-[#1a4d4d]/30 backdrop-blur-sm"
                  : "border-white/30 bg-white/5 hover:bg-white/10"
              } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="text-lg font-bold text-white">Excel</div>
              <div className="text-sm text-white/70 mt-1">
                Excel-compatible CSV (UTF-8 BOM)
              </div>
            </button>
          </div>
        </div>

        {/* Download Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleDownload}
            disabled={isGenerating || loading}
            className={`px-6 py-3 text-white rounded-lg shadow-lg transition font-bold border ${
              isGenerating || loading 
                ? "bg-[#1a4d4d]/60 cursor-not-allowed border-[#1a4d4d]/50" 
                : "bg-[#1a4d4d]/80 backdrop-blur-sm hover:bg-[#1a4d4d]/90 border-[#1a4d4d]/50"
            }`}
          >
            {isGenerating ? "Generating File..." : "Download Report"}
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
