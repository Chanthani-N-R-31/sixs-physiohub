"use client";

import { useState, useEffect, useCallback } from "react";

interface MetadataProps {
  initialData?: any;
  onSave?: (data: any) => void;
}

export default function Metadata({ initialData, onSave }: MetadataProps) {
  const [form, setForm] = useState({
    height: initialData?.height ?? "",
    mass: initialData?.mass ?? "",
    dominantSide: initialData?.dominantSide || "",
    footStrikeHabit: initialData?.footStrikeHabit || "",
    environment: initialData?.environment || "",
    footwearType: initialData?.footwearType || "",
    warmupStandardized: initialData?.warmupStandardized ?? "",
    assessmentFindings: initialData?.assessmentFindings || "",
  });

  const [isSaved, setIsSaved] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setForm({
        height: initialData.height ?? "",
        mass: initialData.mass ?? "",
        dominantSide: initialData.dominantSide || "",
        footStrikeHabit: initialData.footStrikeHabit || "",
        environment: initialData.environment || "",
        footwearType: initialData.footwearType || "",
        warmupStandardized: initialData.warmupStandardized ?? "",
        assessmentFindings: initialData.assessmentFindings || "",
      });
    }
  }, [initialData]);

  // Validate numeric input (allows decimals)
  const validateNumber = (value: string): string | null => {
    if (value === "") return null; // Empty is allowed
    const num = Number(value);
    if (isNaN(num)) return "Must be a number";
    if (num < 0) return "Must be positive";
    return null;
  };

  // Filter to only allow numbers and decimal point
  const filterNumeric = (value: string): string => {
    return value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'); // Only one decimal point
  };

  const update = useCallback((key: string, value: string | boolean) => {
    let processedValue: string | boolean = value;
    
    // Handle numeric fields (height, mass)
    if ((key === "height" || key === "mass") && typeof value === "string") {
      processedValue = filterNumeric(value);
      const error = validateNumber(processedValue);
      if (error) {
        setValidationErrors((prev) => ({ ...prev, [key]: error }));
      } else {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
      }
    } else {
      // Clear validation error for other fields
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
    
    setForm((prev) => ({ ...prev, [key]: processedValue }));
    setIsSaved(false);
  }, []);

  const handleSave = () => {
    // Convert values to proper types before saving
    const dataToSave = {
      height: form.height ? parseFloat(form.height as string) : undefined,
      mass: form.mass ? parseFloat(form.mass as string) : undefined,
      dominantSide: form.dominantSide || undefined,
      footStrikeHabit: form.footStrikeHabit || undefined,
      environment: form.environment || undefined,
      footwearType: form.footwearType || undefined,
      warmupStandardized: form.warmupStandardized === "Yes" ? true : form.warmupStandardized === "No" ? false : undefined,
      assessmentFindings: form.assessmentFindings || undefined,
    };

    if (onSave) {
      onSave(dataToSave);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900">Participant & Session Metadata</h3>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 font-medium">
              <th className="py-2">Parameter</th>
              <th className="py-2">Description</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-gray-900">Height (cm)</td>
              <td>
                <input
                  type="number"
                  step="0.1"
                  className={`input-field ${validationErrors.height ? "border-red-500" : ""}`}
                  placeholder="Enter height in cm"
                  value={form.height}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                      update("height", val);
                    }
                  }}
                />
                {validationErrors.height && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.height}</p>
                )}
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Mass (kg)</td>
              <td>
                <input
                  type="number"
                  step="0.1"
                  className={`input-field ${validationErrors.mass ? "border-red-500" : ""}`}
                  placeholder="Enter mass in kg"
                  value={form.mass}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                      update("mass", val);
                    }
                  }}
                />
                {validationErrors.mass && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.mass}</p>
                )}
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Dominant Side</td>
              <td>
                <select
                  className="input-field"
                  value={form.dominantSide}
                  onChange={(e) => update("dominantSide", e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Right">Right</option>
                  <option value="Left">Left</option>
                </select>
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Foot Strike Habit</td>
              <td>
                <select
                  className="input-field"
                  value={form.footStrikeHabit}
                  onChange={(e) => update("footStrikeHabit", e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Rearfoot">Rearfoot</option>
                  <option value="Midfoot">Midfoot</option>
                  <option value="Forefoot">Forefoot</option>
                </select>
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Environment</td>
              <td>
                <select
                  className="input-field"
                  value={form.environment}
                  onChange={(e) => update("environment", e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Lab">Lab</option>
                  <option value="Track">Track</option>
                  <option value="Trail">Trail</option>
                  <option value="Urban">Urban</option>
                </select>
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Footwear Type</td>
              <td>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter footwear type"
                  value={form.footwearType}
                  onChange={(e) => update("footwearType", e.target.value)}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Warm-up Standardized</td>
              <td>
                <select
                  className="input-field"
                  value={form.warmupStandardized === true ? "Yes" : form.warmupStandardized === false ? "No" : ""}
                  onChange={(e) => update("warmupStandardized", e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Assessment Findings */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Assessment Findings</h4>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical"
          rows={4}
          placeholder="Enter assessment findings"
          value={form.assessmentFindings}
          onChange={(e) => update("assessmentFindings", e.target.value)}
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        {isSaved && (
          <span className="text-green-600 text-sm flex items-center">
            ✓ Saved successfully
          </span>
        )}
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 font-medium"
        >
          Save Section
        </button>
      </div>
    </div>
  );
}
