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
      <h3 className="text-3xl font-bold text-white text-center">Running / Gait Assessment</h3>

      <div className="bg-gray-100 p-4 rounded-xl border border-gray-400 shadow-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-black font-bold border-b border-gray-400">
              <th className="py-3">Parameter</th>
              <th className="py-3">Values</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-400">
            <tr>
              <td className="py-3 text-black font-bold">Running Speed (m/s)</td>
              <td>
                <input
                  type="number"
                  step="0.1"
                  className="w-full p-2 bg-white border border-gray-400 text-black rounded font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <td className="py-3 text-black font-bold">Cadence (steps/min)</td>
              <td>
                <input
                  type="number"
                  step="0.1"
                  className="w-full p-2 bg-white border border-gray-400 text-black rounded font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <td className="py-3 text-black font-bold">Stride Length (m)</td>
              <td>
                <input
                  type="number"
                  step="0.1"
                  className="w-full p-2 bg-white border border-gray-400 text-black rounded font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <td className="py-3 text-black font-bold">Load Condition (% BW)</td>
              <td>
                <input
                  type="number"
                  step="0.1"
                  className="w-full p-2 bg-white border border-gray-400 text-black rounded font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <td className="py-3 text-black font-bold">Surface Type</td>
              <td>
                <select
                  className="w-full p-2 bg-white border border-gray-400 text-black rounded font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
      <div className="bg-gray-100 p-4 rounded-xl border border-gray-400 shadow-lg">
        <h4 className="text-lg font-bold text-black mb-3">Assessment Findings</h4>
        <textarea
          className="w-full p-3 bg-white border border-gray-400 text-black rounded font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
          rows={4}
          placeholder="Enter assessment findings"
          value={form.assessmentFindings}
          onChange={(e) => update("assessmentFindings", e.target.value)}
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        {isSaved && (
          <span className="text-green-600 text-sm flex items-center font-bold">
            ✓ Saved successfully
          </span>
        )}
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-gray-300 text-black font-bold rounded-lg shadow-lg hover:bg-gray-400 transition-all"
        >
          Save Section
        </button>
      </div>
    </div>
  );
}
