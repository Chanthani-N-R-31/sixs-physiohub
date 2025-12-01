// src/components/forms/physiotherapy/StrengthStability.tsx
"use client";

import { useState, useCallback, useEffect } from "react";

interface StrengthStabilityProps {
  initialData?: any;
  onSave?: (data: any) => void;
}

export default function StrengthStability({ initialData, onSave }: StrengthStabilityProps) {
  const [data, setData] = useState({
    // CORE
    plankTime: "",
    sidePlankL: "",
    sidePlankR: "",
    coreNotes: "",

    // BALANCE
    staticBalance: "",
    dynamicBalance: "",
    balanceNotes: "",
    assessmentFindings: "",
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);

  // Load initial data if provided
  useEffect(() => {
    if (initialData) {
      setData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);


  // Helper function to remove numbers from text-only fields
  const filterTextOnly = (value: string): string => {
    return value.replace(/[0-9]/g, '');
  };

  // Validate number input (0-5 for strength scores)
  const validateNumber = (value: string, min: number = 0, max: number = 5): string | null => {
    if (value === "") return null; // Empty is allowed
    const num = Number(value);
    if (isNaN(num)) return "Invalid value";
    if (num < min || num > max) return "Invalid value";
    return null;
  };

  // Stable update function to prevent re-renders and cursor jumps
  const u = useCallback((key: string, val: string, isTextOnly: boolean = false, isNumber: boolean = false) => {
    let processedValue = val;
    
    // Filter numbers from text-only fields
    if (isTextOnly && typeof val === 'string') {
      processedValue = filterTextOnly(val);
    }
    
    // Validate number fields
    if (isNumber && val !== "") {
      const error = validateNumber(val, 0, 5);
      if (error) {
        setValidationErrors((prev) => ({ ...prev, [key]: error }));
      } else {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
      }
    }
    
    setData((p) => {
      // Only update if value actually changed to prevent unnecessary re-renders
      if (p[key as keyof typeof p] === processedValue) {
        return p;
      }
      return { ...p, [key]: processedValue };
    });

    // Clear validation error when user starts typing (for non-number fields)
    if (!isNumber) {
      setValidationErrors((prev) => {
        if (prev[key]) {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        }
        return prev;
      });
    }
  }, []);

  return (
    <div className="space-y-10">
      <h3 className="text-xl font-bold text-white">Strength & Stability</h3>

      {/* ===================== CORE SECTION ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Core Stability</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-900">Plank Hold Time (seconds)</label>
            <div>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={data.plankTime}
                onChange={(e) => {
                  const val = e.target.value;
                  // Only allow numbers, no letters
                  if (val === "" || /^\d*\.?\d*$/.test(val)) {
                    u("plankTime", val, false, true);
                  }
                }}
                className={`w-full mt-1 p-2 border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  validationErrors.plankTime ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0-5"
              />
              {validationErrors.plankTime && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.plankTime}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-900">Side Plank - Left (seconds)</label>
            <div>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={data.sidePlankL}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^\d*\.?\d*$/.test(val)) {
                    u("sidePlankL", val, false, true);
                  }
                }}
                className={`w-full mt-1 p-2 border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  validationErrors.sidePlankL ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0-5"
              />
              {validationErrors.sidePlankL && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.sidePlankL}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-900">Side Plank - Right (seconds)</label>
            <div>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={data.sidePlankR}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^\d*\.?\d*$/.test(val)) {
                    u("sidePlankR", val, false, true);
                  }
                }}
                className={`w-full mt-1 p-2 border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  validationErrors.sidePlankR ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0-5"
              />
              {validationErrors.sidePlankR && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.sidePlankR}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-900">Notes</label>
          <div>
            <textarea
              value={data.coreNotes}
              onChange={(e) => u("coreNotes", e.target.value, true)}
              className={`w-full p-3 mt-1 border rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical ${
                validationErrors.coreNotes ? "border-red-500" : "border-gray-300"
              }`}
              rows={3}
              placeholder="Weak core, compensations, shaking, alignment issues... (text only, no numbers)"
            />
            {validationErrors.coreNotes && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.coreNotes}</p>
            )}
          </div>
        </div>
      </section>

      {/* ===================== BALANCE SECTION ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Balance</h4>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-900">Static Balance</label>
            <input
              type="text"
              value={data.staticBalance}
              onChange={(e) => u("staticBalance", e.target.value)}
              className="w-full mt-1 p-2 border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
              placeholder="Enter static balance assessment"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-900">Dynamic Balance</label>
            <input
              type="text"
              value={data.dynamicBalance}
              onChange={(e) => u("dynamicBalance", e.target.value)}
              className="w-full mt-1 p-2 border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
              placeholder="Enter dynamic balance assessment"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-900">Notes</label>
            <textarea
              value={data.balanceNotes}
              onChange={(e) => u("balanceNotes", e.target.value, true)}
              className={`w-full p-3 mt-1 border rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical ${
                validationErrors.balanceNotes ? "border-red-500" : "border-gray-300"
              }`}
              rows={3}
              placeholder="Balance notes (text only, no numbers)"
            />
            {validationErrors.balanceNotes && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.balanceNotes}</p>
            )}
          </div>
        </div>
      </section>

      {/* ===================== ASSESSMENT FINDINGS ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Assessment Findings</h4>
        <textarea
          value={data.assessmentFindings}
          onChange={(e) => {
            const newValue = filterTextOnly(e.target.value);
            u("assessmentFindings", newValue, true);
          }}
          className={`w-full p-3 border rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical ${
            validationErrors.assessmentFindings ? "border-red-500" : "border-gray-300"
          }`}
          rows={4}
          placeholder="Enter assessment findings (text only, no numbers)"
        />
        {validationErrors.assessmentFindings && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.assessmentFindings}</p>
        )}
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
              onSave(data);
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
