"use client";

import { useState, useEffect, useCallback } from "react";

interface SpatiotemporalProps {
  initialData?: any;
  onSave?: (data: any) => void;
}

export default function Spatiotemporal({ initialData, onSave }: SpatiotemporalProps) {
  const metrics = [
    { key: "speed", label: "Speed (m/s)" },
    { key: "cadence", label: "Cadence (steps/min)" },
    { key: "contactTime", label: "Contact Time (ms)" },
    { key: "flightTime", label: "Flight Time (ms)" },
    { key: "dutyFactor", label: "Duty Factor (%)" },
    { key: "asymmetryIndex", label: "Asymmetry Index (%)" },
  ];

  const [form, setForm] = useState({
    speed: initialData?.speed ?? "",
    cadence: initialData?.cadence ?? "",
    contactTime: initialData?.contactTime ?? "",
    flightTime: initialData?.flightTime ?? "",
    dutyFactor: initialData?.dutyFactor ?? "",
    asymmetryIndex: initialData?.asymmetryIndex ?? "",
    assessmentFindings: initialData?.assessmentFindings || "",
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        speed: initialData.speed ?? "",
        cadence: initialData.cadence ?? "",
        contactTime: initialData.contactTime ?? "",
        flightTime: initialData.flightTime ?? "",
        dutyFactor: initialData.dutyFactor ?? "",
        asymmetryIndex: initialData.asymmetryIndex ?? "",
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
      speed: form.speed ? parseFloat(form.speed as string) : undefined,
      cadence: form.cadence ? parseFloat(form.cadence as string) : undefined,
      contactTime: form.contactTime ? parseFloat(form.contactTime as string) : undefined,
      flightTime: form.flightTime ? parseFloat(form.flightTime as string) : undefined,
      dutyFactor: form.dutyFactor ? parseFloat(form.dutyFactor as string) : undefined,
      asymmetryIndex: form.asymmetryIndex ? parseFloat(form.asymmetryIndex as string) : undefined,
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
      <h3 className="text-xl font-bold text-white">Spatiotemporal Metrics</h3>

      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white font-bold font-bold border-b border-gray-700">
              <th className="py-3">Parameter</th>
              <th className="py-3">Values</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {metrics.map((metric) => (
              <tr key={metric.key}>
                <td className="py-3 text-white font-bold">{metric.label}</td>
                <td>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full p-2 input-glass font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter value"
                    value={form[metric.key as keyof typeof form] as string}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        update(metric.key, val);
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


