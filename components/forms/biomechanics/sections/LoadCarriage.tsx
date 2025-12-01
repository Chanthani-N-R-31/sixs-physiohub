"use client";

import { useState, useEffect, useCallback } from "react";

interface LoadCarriageProps {
  initialData?: any;
  onSave?: (data: any) => void;
}

export default function LoadCarriage({ initialData, onSave }: LoadCarriageProps) {
  const rows = [
    { key: "deltaSpeed", label: "Speed (m/s)" },
    { key: "deltaContactTime", label: "Contact time (ms/%)" },
    { key: "deltaTibialAcceleration", label: "Tibial acceleration (g)" },
    { key: "deltaTrunkSway", label: "Trunk sway (°/g)" },
    { key: "loadEffectIndex", label: "Load Effect Index (%)" },
  ];

  const [form, setForm] = useState({
    deltaSpeed: initialData?.deltaSpeed ?? "",
    deltaContactTime: initialData?.deltaContactTime ?? "",
    deltaTibialAcceleration: initialData?.deltaTibialAcceleration ?? "",
    deltaTrunkSway: initialData?.deltaTrunkSway ?? "",
    loadEffectIndex: initialData?.loadEffectIndex ?? "",
    assessmentFindings: initialData?.assessmentFindings || "",
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        deltaSpeed: initialData.deltaSpeed ?? "",
        deltaContactTime: initialData.deltaContactTime ?? "",
        deltaTibialAcceleration: initialData.deltaTibialAcceleration ?? "",
        deltaTrunkSway: initialData.deltaTrunkSway ?? "",
        loadEffectIndex: initialData.loadEffectIndex ?? "",
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
      deltaSpeed: form.deltaSpeed ? parseFloat(form.deltaSpeed as string) : undefined,
      deltaContactTime: form.deltaContactTime ? parseFloat(form.deltaContactTime as string) : undefined,
      deltaTibialAcceleration: form.deltaTibialAcceleration ? parseFloat(form.deltaTibialAcceleration as string) : undefined,
      deltaTrunkSway: form.deltaTrunkSway ? parseFloat(form.deltaTrunkSway as string) : undefined,
      loadEffectIndex: form.loadEffectIndex ? parseFloat(form.loadEffectIndex as string) : undefined,
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
      <h3 className="text-xl font-bold text-white">Load-Carriage Effects</h3>

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
                    className="w-full p-2 input-glass font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          className="w-full p-3 textarea-glass font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
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


