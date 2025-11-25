"use client";

import { useState, useEffect, useCallback } from "react";

interface RunningProps {
  initialData?: any;
  onSave?: (data: any) => void;
}

export default function Running({ initialData, onSave }: RunningProps) {
  const [form, setForm] = useState({
    runningSpeed: initialData?.runningSpeed ?? "",
    cadence: initialData?.cadence ?? "",
    strideLength: initialData?.strideLength ?? "",
    loadCondition: initialData?.loadCondition ?? "",
    surfaceType: initialData?.surfaceType || "",
    assessmentFindings: initialData?.assessmentFindings || "",
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        runningSpeed: initialData.runningSpeed ?? "",
        cadence: initialData.cadence ?? "",
        strideLength: initialData.strideLength ?? "",
        loadCondition: initialData.loadCondition ?? "",
        surfaceType: initialData.surfaceType || "",
        assessmentFindings: initialData.assessmentFindings || "",
      });
    }
  }, [initialData]);

  const update = useCallback((key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsSaved(false);
  }, []);

  const handleSave = () => {
    const dataToSave = {
      runningSpeed: form.runningSpeed ? parseFloat(form.runningSpeed as string) : undefined,
      cadence: form.cadence ? parseFloat(form.cadence as string) : undefined,
      strideLength: form.strideLength ? parseFloat(form.strideLength as string) : undefined,
      loadCondition: form.loadCondition ? parseFloat(form.loadCondition as string) : undefined,
      surfaceType: form.surfaceType || undefined,
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
      <h3 className="text-xl font-semibold text-gray-900">Running / Gait Assessment</h3>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 font-medium">
              <th className="py-2">Parameter</th>
              <th className="py-2">Values</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-gray-900">Running Speed (m/s)</td>
              <td>
                <input
                  type="number"
                  step="0.1"
                  className="input-field"
                  placeholder="Enter running speed"
                  value={form.runningSpeed}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                      update("runningSpeed", val);
                    }
                  }}
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 text-gray-900">Cadence (steps/min)</td>
              <td>
                <input
                  type="number"
                  step="0.1"
                  className="input-field"
                  placeholder="Enter cadence"
                  value={form.cadence}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                      update("cadence", val);
                    }
                  }}
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 text-gray-900">Stride Length (m)</td>
              <td>
                <input
                  type="number"
                  step="0.1"
                  className="input-field"
                  placeholder="Enter stride length"
                  value={form.strideLength}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                      update("strideLength", val);
                    }
                  }}
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 text-gray-900">Load Condition (% BW)</td>
              <td>
                <input
                  type="number"
                  step="0.1"
                  className="input-field"
                  placeholder="Enter load condition"
                  value={form.loadCondition}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                      update("loadCondition", val);
                    }
                  }}
                />
              </td>
            </tr>
            <tr>
              <td className="py-2 text-gray-900">Surface Type</td>
              <td>
                <select
                  className="input-field"
                  value={form.surfaceType}
                  onChange={(e) => update("surfaceType", e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Track">Track</option>
                  <option value="Trail">Trail</option>
                  <option value="Sand">Sand</option>
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
