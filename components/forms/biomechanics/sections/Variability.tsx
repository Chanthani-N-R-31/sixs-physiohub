"use client";

import { useState, useEffect, useCallback } from "react";

interface VariabilityProps {
  initialData?: any;
  onSave?: (data: any) => void;
}

export default function Variability({ initialData, onSave }: VariabilityProps) {
  const rows = [
    { key: "cadenceDrift", label: "Cadence drift (%)" },
    { key: "contactTimeChange", label: "Contact time change (ms/%)" },
    { key: "stepVariability", label: "Step variability (CV%)" },
    { key: "dynamicStability", label: "Dynamic stability (LDS)" },
    { key: "fatigueSymmetryChange", label: "Symmetry change with fatigue (%)" },
  ];

  const [form, setForm] = useState({
    cadenceDrift: initialData?.cadenceDrift ?? "",
    contactTimeChange: initialData?.contactTimeChange ?? "",
    stepVariability: initialData?.stepVariability ?? "",
    dynamicStability: initialData?.dynamicStability ?? "",
    fatigueSymmetryChange: initialData?.fatigueSymmetryChange ?? "",
    assessmentFindings: initialData?.assessmentFindings || "",
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        cadenceDrift: initialData.cadenceDrift ?? "",
        contactTimeChange: initialData.contactTimeChange ?? "",
        stepVariability: initialData.stepVariability ?? "",
        dynamicStability: initialData.dynamicStability ?? "",
        fatigueSymmetryChange: initialData.fatigueSymmetryChange ?? "",
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
      cadenceDrift: form.cadenceDrift ? parseFloat(form.cadenceDrift as string) : undefined,
      contactTimeChange: form.contactTimeChange ? parseFloat(form.contactTimeChange as string) : undefined,
      stepVariability: form.stepVariability ? parseFloat(form.stepVariability as string) : undefined,
      dynamicStability: form.dynamicStability ? parseFloat(form.dynamicStability as string) : undefined,
      fatigueSymmetryChange: form.fatigueSymmetryChange ? parseFloat(form.fatigueSymmetryChange as string) : undefined,
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
      <h3 className="text-xl font-bold text-white">Variability, Fatigue & Stability</h3>

      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/70 font-bold border-b border-gray-700">
              <th className="py-3">Parameter</th>
              <th className="py-3">Values</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {rows.map((row) => (
              <tr key={row.key}>
                <td className="py-3 text-white font-medium">{row.label}</td>
                <td>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-bold placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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


