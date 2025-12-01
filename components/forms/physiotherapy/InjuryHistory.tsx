// src/components/forms/physiotherapy/InjuryHistory.tsx
"use client";

import { useState, useEffect, useCallback } from "react";

interface InjuryHistoryProps {
  initialData?: any;
  onSave?: (data: any) => void;
}

export default function InjuryHistory({ initialData, onSave }: InjuryHistoryProps) {
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

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);

  // Load initial data if provided
  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);


  // Helper function to remove numbers from text-only fields
  const filterTextOnly = (value: string): string => {
    return value.replace(/[0-9]/g, '');
  };

  // Stable update function to prevent re-renders and cursor jumps
  const update = useCallback((key: string, value: string, isTextOnly: boolean = false) => {
    let processedValue = value;
    
    // Filter numbers from text-only fields
    if (isTextOnly && typeof value === 'string') {
      processedValue = filterTextOnly(value);
    }
    
    setForm((prev) => {
      // Only update if value actually changed to prevent unnecessary re-renders
      if (prev[key as keyof typeof prev] === processedValue) {
        return prev;
      }
      return { ...prev, [key]: processedValue };
    });

    // Clear validation error when user starts typing
    setValidationErrors((prev) => {
      if (prev[key]) {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      }
      return prev;
    });
  }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, []);

  const handleRemoveImage = useCallback(() => {
    setForm((prev) => {
      if (prev.diagnosisImagePreview) {
        URL.revokeObjectURL(prev.diagnosisImagePreview);
      }
      return {
        ...prev,
        diagnosisImage: null,
        diagnosisImagePreview: "",
      };
    });
  }, []);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (form.diagnosisImagePreview) {
        URL.revokeObjectURL(form.diagnosisImagePreview);
      }
    };
  }, [form.diagnosisImagePreview]);

  // Reusable input cell renderer - stable controlled component
  const InputCell = useCallback(({ value, onChange, placeholder, type = "text", error, isTextOnly = false }: any) => (
    <div>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => {
          const newValue = isTextOnly ? filterTextOnly(e.target.value) : e.target.value;
          onChange(newValue);
        }}
        className={`w-full p-2 input-glass font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? "border-red-500" : ""
        }`}
        placeholder={placeholder}
      />
      {error && <p className="text-red-300 text-xs mt-1 font-medium">{error}</p>}
    </div>
  ), []);

  // Reusable select cell renderer - stable controlled component
  const SelectCell = useCallback(({ value, onChange, options, error }: any) => (
    <div>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-2 select-glass font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error ? "border-red-500" : ""
        }`}
      >
          <option value="" className="text-gray-900">Select</option>
          {options.map((opt: string) => (
            <option key={opt} value={opt} className="text-gray-900">
              {opt}
            </option>
          ))}
      </select>
      {error && <p className="text-red-300 text-xs mt-1 font-medium">{error}</p>}
    </div>
  ), []);

  // Reusable textarea cell renderer - stable controlled component
  const TextareaCell = useCallback(({ value, onChange, placeholder, rows = 2, error, isTextOnly = false }: any) => (
    <div>
      <textarea
        value={value || ""}
        onChange={(e) => {
          const newValue = isTextOnly ? filterTextOnly(e.target.value) : e.target.value;
          onChange(newValue);
        }}
        className={`w-full p-2 textarea-glass font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
          error ? "border-red-500" : ""
        }`}
        placeholder={placeholder}
        rows={rows}
      />
      {error && <p className="text-red-300 text-xs mt-1 font-medium">{error}</p>}
    </div>
  ), []);

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-bold text-white">Injury History</h3>

      {/* ===================== PREVIOUS INJURIES ====================== */}
      <section className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
        <h4 className="text-lg font-bold text-white mb-3">
          Previous Injuries (If applicable)
        </h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/70 font-bold border-b border-gray-700">
              <th className="py-3">Parameter</th>
              <th className="py-3">Description</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            <tr>
              <td className="py-3 text-white font-medium">Diagnosis</td>
              <td>
                <InputCell
                  value={form.previousInjuriesDiagnosis}
                  onChange={(v: string) => update("previousInjuriesDiagnosis", v, true)}
                  placeholder="Enter diagnosis (text only)"
                  isTextOnly={true}
                  error={validationErrors.previousInjuriesDiagnosis}
                />
              </td>
            </tr>

            <tr>
              <td className="py-3 text-white font-medium">Side</td>
              <td>
                <SelectCell
                  value={form.previousInjuriesSide}
                  onChange={(v: string) => update("previousInjuriesSide", v)}
                  options={["Left", "Right", "Bilateral"]}
                />
              </td>
            </tr>

            <tr>
              <td className="py-3 text-white font-medium">Duration (How long ago)</td>
              <td>
                <InputCell
                  value={form.previousInjuriesDuration}
                  onChange={(v: string) => update("previousInjuriesDuration", v)}
                  placeholder="Eg: 2 weeks ago, 3 months ago"
                />
              </td>
            </tr>

            <tr>
              <td className="py-3 text-white font-medium">Method of management</td>
              <td>
                <SelectCell
                  value={form.previousInjuriesMethod}
                  onChange={(v: string) => update("previousInjuriesMethod", v)}
                  options={["Rehab", "Surgery", "None"]}
                />
              </td>
            </tr>

            <tr>
              <td className="py-3 text-white font-medium">Recovery status</td>
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
      <section className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
        <h4 className="text-lg font-bold text-white mb-3">
          Current Injuries / Symptoms (If Applicable)
        </h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/70 font-bold border-b border-gray-700">
              <th className="py-3">Parameter</th>
              <th className="py-3">Description</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            <tr>
              <td className="py-3 text-white font-medium">Chief Complaints</td>
              <td>
                <TextareaCell
                  value={form.chiefComplaints}
                  onChange={(v: string) => update("chiefComplaints", v, true)}
                  placeholder="Enter chief complaints (text only, no numbers)"
                  rows={3}
                  isTextOnly={true}
                  error={validationErrors.chiefComplaints}
                />
              </td>
            </tr>

            <tr>
              <td className="py-3 text-white font-medium">History</td>
              <td>
                <TextareaCell
                  value={form.history}
                  onChange={(v: string) => update("history", v, true)}
                  placeholder="Enter history (text only, no numbers)"
                  rows={3}
                  isTextOnly={true}
                  error={validationErrors.history}
                />
              </td>
            </tr>

            <tr>
              <td className="py-3 text-white font-medium">Pain severity (0-10)</td>
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
          </tbody>
        </table>
      </section>

      {/* ===================== DIAGNOSIS ====================== */}
      <section className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
        <h4 className="text-lg font-bold text-white mb-3">Diagnosis</h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/70 font-bold border-b border-gray-700">
              <th className="py-3">Parameter</th>
              <th className="py-3">Image</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            <tr>
              <td className="py-3 text-white font-medium">Clinical / Imaging-based</td>
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
      <section className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
        <h4 className="text-lg font-bold text-white mb-3">Mode of Treatment</h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/70 font-bold border-b border-gray-700">
              <th className="py-3">Parameter</th>
              <th className="py-3">Description</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            <tr>
              <td className="py-3 text-white font-medium">Treatment Type</td>
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

      {/* ===================== ASSESSMENT FINDINGS ====================== */}
      <section className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
        <h4 className="text-lg font-bold text-white mb-3">Assessment Findings</h4>
        <TextareaCell
          value={form.assessmentFindings}
          onChange={(v: string) => update("assessmentFindings", v, true)}
          placeholder="Enter assessment findings (text only, no numbers)"
          rows={4}
          isTextOnly={true}
          error={validationErrors.assessmentFindings}
        />
      </section>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        {isSaved && (
          <span className="text-green-600 text-sm flex items-center">
            ✓ Saved successfully
          </span>
        )}
        <button
          onClick={() => {
            if (onSave) {
              onSave(form);
              setIsSaved(true);
              setTimeout(() => setIsSaved(false), 3000);
            }
          }}
          className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 font-medium"
        >
          Save Section
        </button>
      </div>
    </div>
  );
}
