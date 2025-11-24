"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, getDoc, doc, query, orderBy } from "firebase/firestore";

interface Patient {
  id: string;
  name: string;
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

  // --- 1. LOAD PATIENTS ---
  const loadPatients = async () => {
    try {
      setLoading(true);
      
      // Use the correct collection name: physioAssessments
      const q = query(
        collection(db, "physioAssessments"),
        orderBy("updatedAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      
      const loadedPatients: Patient[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const regDetails = data.registrationDetails || {};
        
        // Extract full name from registrationDetails
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
        });
      });
      
      setPatients(loadedPatients);
    } catch (error) {
      console.error("Error loading patients:", error);
      alert("Error loading data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. HELPER: FLATTEN OBJECTS (for CSV) ---
  const flattenObject = (obj: any, prefix = ""): any => {
    return Object.keys(obj).reduce((acc: any, key: string) => {
      const pre = prefix.length ? prefix + "_" : "";
      
      if (typeof obj[key] === "object" && obj[key] !== null && !(obj[key] instanceof Date)) {
        // Recursively flatten nested objects (like 'fms' or 'rom')
        Object.assign(acc, flattenObject(obj[key], pre + key));
      } else {
        // Handle Firebase Timestamps or standard JS Dates
        let value = obj[key];
        if (obj[key] && typeof obj[key].toDate === 'function') {
            value = obj[key].toDate().toLocaleDateString(); // Firebase Timestamp
        } else if (obj[key] instanceof Date) {
            value = obj[key].toLocaleDateString();
        }
        acc[pre + key] = value;
      }
      return acc;
    }, {});
  };

  // --- 3. HELPER: GENERATE CSV STRING ---
  const convertToCSV = (objArray: any[]) => {
    if (!objArray || objArray.length === 0) return "";
    
    // Get all unique headers from all objects to ensure columns align
    const headers = Array.from(new Set(objArray.flatMap(obj => Object.keys(obj))));
    
    const csvRows = [
      headers.join(","), // Header row
      ...objArray.map(row => 
        headers.map(fieldName => {
          let val = row[fieldName] ?? ""; 
          // Escape quotes and wrap in quotes to handle text with commas
          const stringVal = String(val).replace(/"/g, '""'); 
          return `"${stringVal}"`;
        }).join(",")
      )
    ];

    return csvRows.join("\n");
  };

  // --- 4. HANDLE DOWNLOAD ---
  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      let rawData: any[] = [];

      // Fetch logic - use correct collection name
      if (selectedPatient) {
        // Fetch ONE patient
        const docRef = doc(db, "physioAssessments", selectedPatient);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          rawData.push({ id: docSnap.id, ...docSnap.data() });
        }
      } else {
        // Fetch ALL patients
        const q = query(
          collection(db, "physioAssessments"),
          orderBy("updatedAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          rawData.push({ id: doc.id, ...doc.data() });
        });
      }

      if (rawData.length === 0) {
        alert("No data found to export.");
        setIsGenerating(false);
        return;
      }

      // Process Data
      const flatData = rawData.map(item => flattenObject(item));
      const csvString = convertToCSV(flatData);
      
      // Create Download Link
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `physio_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to export data. Check console.");
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
                      {p.name} (P-{p.id.slice(0, 6)})
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
                />
                All Domains
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="domain"
                  checked={domainFilter === "specific"}
                  onChange={() => setDomainFilter("specific")}
                />
                Specific Domain
              </label>

              {domainFilter === "specific" && (
                <select
                  className="p-2 border border-gray-300 rounded-lg bg-white text-gray-800"
                  value={specificDomain}
                  onChange={(e) => setSpecificDomain(e.target.value)}
                >
                  <option>Physiotherapy</option>
                  <option>Physiology</option>
                  <option>Nutrition</option>
                  <option>Biomechanics</option>
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Format Selector */}
        <div className="mt-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Format
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setExportFormat("csv")}
              className={`p-6 rounded-xl border transition ${
                exportFormat === "csv"
                  ? "border-green-600 bg-green-50"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="text-lg font-semibold text-gray-800">CSV</div>
              <div className="text-sm text-gray-500 mt-1">
                Comma-Separated Values
              </div>
            </button>

            <button
              onClick={() => setExportFormat("xlsx")}
              className={`p-6 rounded-xl border transition ${
                exportFormat === "xlsx"
                  ? "border-green-600 bg-green-50"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <div className="text-lg font-semibold text-gray-800">Excel</div>
              <div className="text-sm text-gray-500 mt-1">
                (Exports as CSV - Open in Excel)
              </div>
            </button>
          </div>
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