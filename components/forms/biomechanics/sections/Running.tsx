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
      <h3 className="text-xl font-bold text-white">Running / Gait Assessment</h3>

      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/70 font-bold border-b border-gray-700">
              <th className="py-3">Parameter</th>
              <th className="py-3">Values</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            <tr>
              <td className="py-3 text-white font-medium">Running Speed (m/s)</td>
              <td>
                <input
                  type="number"
                  step="0.1"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-bold placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <td className="py-3 text-white font-medium">Cadence (steps/min)</td>
              <td>
                <input
                  type="number"
                  step="0.1"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-bold placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <td className="py-3 text-white font-medium">Stride Length (m)</td>
              <td>
                <input
                  type="number"
                  step="0.1"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-bold placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <td className="py-3 text-white font-medium">Load Condition (% BW)</td>
              <td>
                <input
                  type="number"
                  step="0.1"
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-bold placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <td className="py-3 text-white font-medium">Surface Type</td>
              <td>
                <select
                  className="w-full p-2 bg-white/20 backdrop-blur-md border border-white/40 rounded-lg text-white font-bold focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 shadow-lg"
                  value={form.surfaceType}
                  onChange={(e) => update("surfaceType", e.target.value)}
                >
                  <option value="" className="text-gray-900">Select</option>
                  <option value="Track" className="text-gray-900">Track</option>
                  <option value="Trail" className="text-gray-900">Trail</option>
                  <option value="Sand" className="text-gray-900">Sand</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Assessment Findings */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
        <h4 className="text-lg font-bold text-white mb-3">Assessment Findings</h4>
        <textarea
          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white font-bold placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
          rows={4}
          placeholder="Enter assessment findings"
          value={form.assessmentFindings}
          onChange={(e) => update("assessmentFindings", e.target.value)}
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        {isSaved && (
          <span className="text-green-300 text-sm flex items-center font-bold">
            ✓ Saved successfully
          </span>
        )}
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-blue-900 text-white rounded-lg shadow-lg hover:bg-blue-800 transition-all font-bold border border-blue-800"
        >
          Save Section
        </button>
      </div>
    </div>
  );
}
