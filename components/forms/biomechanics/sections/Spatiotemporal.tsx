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

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 font-medium">
              <th className="py-2">Parameter</th>
              <th className="py-2">Values</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {metrics.map((metric) => (
              <tr key={metric.key}>
                <td className="py-2 text-gray-900">{metric.label}</td>
                <td>
                  <input
                    type="number"
                    step="0.1"
                    className="input-field"
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


