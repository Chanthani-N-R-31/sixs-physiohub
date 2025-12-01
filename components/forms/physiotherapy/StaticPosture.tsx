// src/components/forms/physiotherapy/StaticPosture.tsx
"use client";

import { useState, useCallback, useEffect } from "react";

interface StaticPostureProps {
  initialData?: any;
  onSave?: (data: any) => void;
}

export default function StaticPosture({ initialData, onSave }: StaticPostureProps) {
  const [form, setForm] = useState({
    // Anterior View
    headTilt: "",
    shoulderAlignment: "",
    trunkAlignment: "",
    pelvicAlignment: "",
    kneeAlignmentAnterior: "",

    // Lateral View
    headAlignmentLat: "",
    shoulderAlignmentLat: "",
    spinalCurves: "",
    pelvicTilt: "",
    kneeAlignmentLat: "",

    // Assessment Findings
    observations: "",
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

  // Reusable select cell renderer - stable controlled component
  const SelectCell = useCallback(({ value, onChange, options, error }: any) => (
    <div>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-2 border rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        <option value="">Select</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  ), []);

  // Reusable textarea cell renderer for observations - stable controlled component
  const TextareaCell = useCallback(({ value, onChange, placeholder, rows = 3, error, isTextOnly = false }: any) => (
    <div>
      <textarea
        value={value || ""}
        onChange={(e) => {
          const newValue = isTextOnly ? filterTextOnly(e.target.value) : e.target.value;
          onChange(newValue);
        }}
        className={`w-full p-2 border rounded-md text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        placeholder={placeholder}
        rows={rows}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  ), []);

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-bold text-white">
        Static Posture Assessment
      </h3>

      {/* ===================== ANTERIOR VIEW ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Anterior View</h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 font-medium">
              <th className="py-2">Parameter</th>
              <th className="py-2">Observation</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-gray-900">Head Tilt</td>
              <td>
                <SelectCell
                  value={form.headTilt}
                  onChange={(v: string) => update("headTilt", v)}
                  options={["Neutral", "Left", "Right"]}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Shoulder Alignment</td>
              <td>
                <SelectCell
                  value={form.shoulderAlignment}
                  onChange={(v: string) => update("shoulderAlignment", v)}
                  options={[
                    "Symmetrical",
                    "Elevated (L)",
                    "Elevated (R)",
                    "Depressed (L)",
                    "Depressed (R)",
                  ]}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Trunk Alignment</td>
              <td>
                <SelectCell
                  value={form.trunkAlignment}
                  onChange={(v: string) => update("trunkAlignment", v)}
                  options={[
                    "Midline",
                    "Lateral tilt – Left",
                    "Lateral tilt – Right",
                  ]}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Pelvic Alignment</td>
              <td>
                <SelectCell
                  value={form.pelvicAlignment}
                  onChange={(v: string) => update("pelvicAlignment", v)}
                  options={["Level", "Tilted (L)", "Tilted (R)"]}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Knee Alignment</td>
              <td>
                <SelectCell
                  value={form.kneeAlignmentAnterior}
                  onChange={(v: string) => update("kneeAlignmentAnterior", v)}
                  options={["Valgus", "Varus"]}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===================== LATERAL VIEW ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Lateral View</h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 font-medium">
              <th className="py-2">Parameter</th>
              <th className="py-2">Observation</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-gray-900">Head Alignment</td>
              <td>
                <SelectCell
                  value={form.headAlignmentLat}
                  onChange={(v: string) => update("headAlignmentLat", v)}
                  options={["Neutral", "Forward", "Retracted"]}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Shoulder Alignment</td>
              <td>
                <SelectCell
                  value={form.shoulderAlignmentLat}
                  onChange={(v: string) => update("shoulderAlignmentLat", v)}
                  options={["Aligned", "Protracted"]}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Spinal Curves</td>
              <td>
                <SelectCell
                  value={form.spinalCurves}
                  onChange={(v: string) => update("spinalCurves", v)}
                  options={["Neutral","Lordotic", "Kyphotic","Swayback","Flatback"]}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Pelvic Tilt</td>
              <td>
                <SelectCell
                  value={form.pelvicTilt}
                  onChange={(v: string) => update("pelvicTilt", v)}
                  options={["Neutral", "Anterior", "Posterior"]}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Knee Alignment</td>
              <td>
                <SelectCell
                  value={form.kneeAlignmentLat}
                  onChange={(v: string) => update("kneeAlignmentLat", v)}
                  options={["Neutral", "Hyperextension", "Flexed"]}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===================== ASSESSMENT FINDINGS ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Assessment Findings / Observations</h4>
        <TextareaCell
          value={form.observations}
          onChange={(v: string) => update("observations", v, true)}
          placeholder="Enter observations and findings (text only, no numbers)"
          rows={4}
          isTextOnly={true}
          error={validationErrors.observations}
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
