// src/components/forms/physiotherapy/InjuryHistory.tsx
"use client";

import { useState, useEffect } from "react";

export default function InjuryHistory() {
  const [form, setForm] = useState({
    // Previous Injuries
    previousInjuriesDiagnosis: "",
    previousInjuriesSide: "",
    previousInjuriesDuration: "",
    previousInjuriesMethod: "",
    previousInjuriesRecovery: "",

    // Current Injuries / Symptoms
    chiefComplaints: "",
    history: "",
    painSeverity: "",
    assessmentFindings: "",

    // Diagnosis
    diagnosis: "",
    diagnosisImage: null as File | null,
    diagnosisImagePreview: "",

    // Mode of Treatment
    modeOfTreatment: "",
  });

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      setForm((prev) => ({
        ...prev,
        diagnosisImage: file,
        diagnosisImagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleRemoveImage = () => {
    if (form.diagnosisImagePreview) {
      URL.revokeObjectURL(form.diagnosisImagePreview);
    }
    setForm((prev) => ({
      ...prev,
      diagnosisImage: null,
      diagnosisImagePreview: "",
    }));
  };

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (form.diagnosisImagePreview) {
        URL.revokeObjectURL(form.diagnosisImagePreview);
      }
    };
  }, [form.diagnosisImagePreview]);

  // Reusable input cell renderer
  const InputCell = ({ value, onChange, placeholder, type = "text" }: any) => (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500"
      placeholder={placeholder}
    />
  );

  // Reusable select cell renderer
  const SelectCell = ({ value, onChange, options }: any) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
    >
      <option value="">Select</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );

  // Reusable textarea cell renderer
  const TextareaCell = ({ value, onChange, placeholder, rows = 2 }: any) => (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500"
      placeholder={placeholder}
      rows={rows}
    />
  );

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900">Injury History</h3>

      {/* ===================== PREVIOUS INJURIES ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">
          Previous Injuries (If applicable)
        </h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 font-medium">
              <th className="py-2">Parameter</th>
              <th className="py-2">Description</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-gray-900">Diagnosis</td>
              <td>
                <InputCell
                  value={form.previousInjuriesDiagnosis}
                  onChange={(v: string) => update("previousInjuriesDiagnosis", v)}
                  placeholder="Enter diagnosis"
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Side</td>
              <td>
                <SelectCell
                  value={form.previousInjuriesSide}
                  onChange={(v: string) => update("previousInjuriesSide", v)}
                  options={["Left", "Right", "Bilateral"]}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Duration (How long ago)</td>
              <td>
                <InputCell
                  value={form.previousInjuriesDuration}
                  onChange={(v: string) => update("previousInjuriesDuration", v)}
                  placeholder="Eg: 2 weeks ago, 3 months ago"
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Method of management</td>
              <td>
                <SelectCell
                  value={form.previousInjuriesMethod}
                  onChange={(v: string) => update("previousInjuriesMethod", v)}
                  options={["Rehab", "Surgery", "None"]}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Recovery status</td>
              <td>
                <SelectCell
                  value={form.previousInjuriesRecovery}
                  onChange={(v: string) => update("previousInjuriesRecovery", v)}
                  options={["Partially recovered", "Fully recovered"]}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===================== CURRENT INJURIES / SYMPTOMS ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">
          Current Injuries / Symptoms (If Applicable)
        </h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 font-medium">
              <th className="py-2">Parameter</th>
              <th className="py-2">Description</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-gray-900">Chief Complaints</td>
              <td>
                <TextareaCell
                  value={form.chiefComplaints}
                  onChange={(v: string) => update("chiefComplaints", v)}
                  placeholder="Enter chief complaints"
                  rows={3}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">History</td>
              <td>
                <TextareaCell
                  value={form.history}
                  onChange={(v: string) => update("history", v)}
                  placeholder="Enter history"
                  rows={3}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Pain severity (0-10)</td>
              <td>
                <div className="py-2">
                  {/* Ruler Scale */}
                  <div className="flex items-center gap-1 mb-2">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => update("painSeverity", num.toString())}
                        className={`flex-1 min-w-[40px] h-12 border-2 rounded-md font-semibold text-sm transition-all ${
                          form.painSeverity === num.toString()
                            ? "bg-green-600 text-white border-green-600 shadow-md scale-105"
                            : "bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Selected: {form.painSeverity || "None"} / 10
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Assessment findings</td>
              <td>
                <TextareaCell
                  value={form.assessmentFindings}
                  onChange={(v: string) => update("assessmentFindings", v)}
                  placeholder="Enter assessment findings"
                  rows={3}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===================== DIAGNOSIS ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Diagnosis</h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 font-medium">
              <th className="py-2">Parameter</th>
              <th className="py-2">Image</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-gray-900">Clinical / Imaging-based</td>
              <td>
                <div className="py-2">
                  {form.diagnosisImagePreview ? (
                    <div className="space-y-3">
                      <div className="relative inline-block">
                        <img
                          src={form.diagnosisImagePreview}
                          alt="Diagnosis preview"
                          className="max-w-full h-auto max-h-64 rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 shadow-md"
                          title="Remove image"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        {form.diagnosisImage?.name}
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-10 h-10 mb-3 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===================== MODE OF TREATMENT ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Mode of Treatment</h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 font-medium">
              <th className="py-2">Parameter</th>
              <th className="py-2">Description</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-gray-900">Treatment Type</td>
              <td>
                <SelectCell
                  value={form.modeOfTreatment}
                  onChange={(v: string) => update("modeOfTreatment", v)}
                  options={["Physiotherapy", "Medical", "Surgical"]}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
