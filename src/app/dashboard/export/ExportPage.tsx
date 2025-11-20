// src/app/dashboard/export/ExportPage.tsx
"use client";

import { useState } from "react";

export default function ExportPage() {
  const [selectedPatient, setSelectedPatient] = useState("");
  const [domainFilter, setDomainFilter] = useState<"all" | "specific">("all");
  const [specificDomain, setSpecificDomain] = useState("Physiotherapy");
  const [exportFormat, setExportFormat] = useState<"csv" | "xlsx">("csv");

  // demo patients
  const patients = [
    { id: "P-001", name: "Asha K" },
    { id: "P-002", name: "Rohit P" },
    { id: "P-003", name: "Meera S" },
    { id: "P-004", name: "Rahul V" },
  ];

  const handleDownload = () => {
    alert(
      `Preparing ${exportFormat.toUpperCase()} report for ${
        selectedPatient ? selectedPatient : "All Patients"
      } | Domain: ${
        domainFilter === "all" ? "All Domains" : specificDomain
      }`
    );
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

            <select
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-green-300"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
            >
              <option value="">All Patients</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
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
                  <option>Biomechanics</option>
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
            Format
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* CSV Card */}
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

            {/* Excel Card */}
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
                Microsoft Excel (.xlsx)
              </div>
            </button>
          </div>
        </div>

        {/* Download Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
          >
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
}
