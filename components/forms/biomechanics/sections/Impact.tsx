"use client";

import { useState, useEffect, useCallback } from "react";

interface ImpactProps {
  initialData?: any;
  onSave?: (data: any) => void;
}

export default function Impact({ initialData, onSave }: ImpactProps) {
  const rows = [
    { key: "peakTibialAcceleration", label: "Peak tibial acceleration (g)" },
    { key: "tibialShockLoadingRate", label: "Tibial shock loading rate (g/s)" },
    { key: "verticalTrunkAcceleration", label: "Vertical trunk acceleration (g)" },
    { key: "verticalStiffness", label: "Vertical stiffness (N/m)" },
  ];

  const [form, setForm] = useState({
    peakTibialAcceleration: initialData?.peakTibialAcceleration ?? "",
    tibialShockLoadingRate: initialData?.tibialShockLoadingRate ?? "",
    verticalTrunkAcceleration: initialData?.verticalTrunkAcceleration ?? "",
    verticalStiffness: initialData?.verticalStiffness ?? "",
    assessmentFindings: initialData?.assessmentFindings || "",
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        peakTibialAcceleration: initialData.peakTibialAcceleration ?? "",
        tibialShockLoadingRate: initialData.tibialShockLoadingRate ?? "",
        verticalTrunkAcceleration: initialData.verticalTrunkAcceleration ?? "",
        verticalStiffness: initialData.verticalStiffness ?? "",
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
      peakTibialAcceleration: form.peakTibialAcceleration ? parseFloat(form.peakTibialAcceleration as string) : undefined,
      tibialShockLoadingRate: form.tibialShockLoadingRate ? parseFloat(form.tibialShockLoadingRate as string) : undefined,
      verticalTrunkAcceleration: form.verticalTrunkAcceleration ? parseFloat(form.verticalTrunkAcceleration as string) : undefined,
      verticalStiffness: form.verticalStiffness ? parseFloat(form.verticalStiffness as string) : undefined,
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
      <h3 className="text-xl font-semibold text-gray-900">Impact & Loading Metrics</h3>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 font-medium">
              <th className="py-2">Parameter</th>
              <th className="py-2">Values</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {rows.map((row) => (
              <tr key={row.key}>
                <td className="py-2 text-gray-900">{row.label}</td>
                <td>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field"
                    placeholder="Enter value"
                    value={form[row.key as keyof typeof form] as string}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        update(row.key, val);
                      }
                    }}
                  />
                </td>
              </tr>
            ))}
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


