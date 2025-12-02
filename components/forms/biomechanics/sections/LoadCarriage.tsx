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
      <h3 className="text-3xl font-bold text-white text-center">Load-Carriage Effects</h3>

      <div className="bg-gray-100 p-4 rounded-xl border border-gray-400 shadow-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-black font-bold border-b border-gray-400">
              <th className="py-3">Parameter</th>
              <th className="py-3">Values</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-400">
            {rows.map((row) => (
              <tr key={row.key}>
                <td className="py-3 text-black font-bold">{row.label}</td>
                <td>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full p-2 bg-white border border-gray-400 text-black rounded font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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


