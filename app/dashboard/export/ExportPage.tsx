"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, getDoc, doc, query, orderBy } from "firebase/firestore";
import {
  loadAllAssessmentData,
  formatExportData,
  convertToCSV,
  downloadCSV,
  downloadExcelCSV,
} from "@/lib/exportData";

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
    loadPatients();
  }, []);

  // --- LOAD PATIENTS FROM ALL DOMAINS ---
  const loadPatients = async () => {
    try {
      setLoading(true);
      
      const loadedPatients: Patient[] = [];
      
      // Load from Physiotherapy
      const physioQuery = query(
        collection(db, "physioAssessments"),
        orderBy("updatedAt", "desc")
      );
      const physioSnapshot = await getDocs(physioQuery);
      
      physioSnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const regDetails = data.registrationDetails || {};
        
        let fullName = regDetails.fullName || "";
        if (!fullName) {
          const parts = [
            regDetails.firstName,
            regDetails.initials,
            regDetails.lastName
          ].filter(Boolean);
          fullName = parts.join(" ").trim() || "Unknown Patient";
        }
        
        loadedPatients.push({
          id: docSnapshot.id,
          name: fullName,
          domain: "Physiotherapy",
        });
      });
      
      // Load from Biomechanics
      try {
        const biomechQuery = query(
          collection(db, "biomechanicsAssessments"),
          orderBy("updatedAt", "desc")
        );
        const biomechSnapshot = await getDocs(biomechQuery);
        
        biomechSnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          const metadata = data.metadata || {};
          
          let fullName = metadata.participantName || metadata.name || "";
          if (!fullName) {
            fullName = "Unknown Patient";
          }
          
          loadedPatients.push({
            id: docSnapshot.id,
            name: fullName,
            domain: "Biomechanics",
          });
        });
      } catch (error) {
        console.warn("Could not load biomechanics assessments:", error);
      }
      
      // Remove duplicates (same ID)
      const uniquePatients = Array.from(
        new Map(loadedPatients.map(p => [p.id, p])).values()
      );
      
      setPatients(uniquePatients);
    } catch (error) {
      console.error("Error loading patients:", error);
      alert("Error loading data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLE DOWNLOAD ---
  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      let rawData: any[] = [];
      
      // Load data based on filters
      if (selectedPatient) {
        // Load specific patient from all domains
        rawData = await loadAllAssessmentData(selectedPatient);
        
        // Filter by domain if specific domain selected
        if (domainFilter === "specific") {
          rawData = rawData.filter(item => item._domain === specificDomain);
        }
      } else {
        // Load all patients
        rawData = await loadAllAssessmentData();
        
        // Filter by domain if specific domain selected
        if (domainFilter === "specific") {
          rawData = rawData.filter(item => item._domain === specificDomain);
        }
      }

      if (rawData.length === 0) {
        alert("No data found to export.");
        setIsGenerating(false);
        return;
      }

      // Format data for export
      const flatData = formatExportData(rawData) as Record<string, any>[];
      
      // Generate CSV
      const csvString = convertToCSV(flatData);
      
      // Determine filename
      let filename = "assessments_export";
      if (selectedPatient) {
        const patient = patients.find(p => p.id === selectedPatient);
        filename = patient ? `patient_${patient.name.replace(/\s+/g, "_")}` : "patient_export";
      }
      if (domainFilter === "specific") {
        filename += `_${specificDomain.toLowerCase()}`;
      }
      
      // Download based on format
      if (exportFormat === "xlsx") {
        downloadExcelCSV(csvString, filename);
      } else {
        downloadCSV(csvString, filename);
      }
      
      alert(`Export completed! ${rawData.length} record(s) exported.`);
      
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Export Data</h2>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        {/* Patient Dropdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Patient
            </label>

            <div className="flex gap-2">
              <select
                className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-green-300"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                disabled={loading || isGenerating}
              >
                <option value="">All Patients</option>
                {loading ? (
                  <option disabled>Loading patients...</option>
                ) : patients.length === 0 ? (
                  <option disabled>No entries found</option>
                ) : (
                  patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (P-{p.id.slice(0, 6)}) {p.domain ? `- ${p.domain}` : ""}
                    </option>
                  ))
                )}
              </select>
              <button
                onClick={loadPatients}
                disabled={loading || isGenerating}
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh patient list"
              >
                ↻
              </button>
            </div>
          </div>

          {/* Domain Choice */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain
            </label>

            <div className="flex flex-wrap gap-4 mt-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="domain"
                  checked={domainFilter === "all"}
                  onChange={() => setDomainFilter("all")}
                  disabled={isGenerating}
                />
                All Domains
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="domain"
                  checked={domainFilter === "specific"}
                  onChange={() => setDomainFilter("specific")}
                  disabled={isGenerating}
                />
                Specific Domain
              </label>

              {domainFilter === "specific" && (
                <select
                  className="p-2 border border-gray-300 rounded-lg bg-white text-gray-800"
                  value={specificDomain}
                  onChange={(e) => setSpecificDomain(e.target.value)}
                  disabled={isGenerating}
                >
                  <option>Physiotherapy</option>
                  <option>Biomechanics</option>
                  <option>Physiology</option>
                  <option>Nutrition</option>
                  <option>Psychology</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Format Selector */}
        <div className="mt-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Export Format
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setExportFormat("csv")}
              disabled={isGenerating}
              className={`p-6 rounded-xl border transition ${
                exportFormat === "csv"
                  ? "border-green-600 bg-green-50"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="text-lg font-semibold text-gray-800">CSV</div>
              <div className="text-sm text-gray-500 mt-1">
                Comma-Separated Values
              </div>
            </button>

            <button
              onClick={() => setExportFormat("xlsx")}
              disabled={isGenerating}
              className={`p-6 rounded-xl border transition ${
                exportFormat === "xlsx"
                  ? "border-green-600 bg-green-50"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="text-lg font-semibold text-gray-800">Excel</div>
              <div className="text-sm text-gray-500 mt-1">
                Excel-compatible CSV (UTF-8 BOM)
              </div>
            </button>
          </div>
        </div>

        {/* Info Message */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> The export will include all assessment data from the selected domains.
            Data will be flattened with nested fields separated by underscores (e.g., registrationDetails_fullName).
          </p>
        </div>

        {/* Download Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleDownload}
            disabled={isGenerating || loading}
            className={`px-6 py-3 text-white rounded-lg shadow transition ${
              isGenerating || loading 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isGenerating ? "Generating File..." : "Download Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
