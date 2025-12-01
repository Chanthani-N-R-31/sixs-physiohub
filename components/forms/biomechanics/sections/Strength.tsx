"use client";

import { useState, useEffect, useCallback } from "react";

interface StrengthProps {
  initialData?: any;
  onSave?: (data: any) => void;
}

// Interfaces updated to match your specific table parameters
interface IsokineticKnee {
  peakTorque?: number;
  power?: number;
}

interface IsokineticAnkle {
  torque?: number;
  power?: number;
}

interface NordicHamstring {
  peakForce?: number;
  avgForce?: number;
  fatigue?: number;
}

export default function Strength({ initialData, onSave }: StrengthProps) {
  // --- Data Initialization ---
  const initializeIsokineticKnee = (data?: IsokineticKnee): IsokineticKnee => ({
    peakTorque: data?.peakTorque ?? undefined,
    power: data?.power ?? undefined,
  });

  const initializeIsokineticAnkle = (data?: IsokineticAnkle): IsokineticAnkle => ({
    torque: data?.torque ?? undefined,
    power: data?.power ?? undefined,
  });

  const initializeNordicHamstring = (data?: NordicHamstring): NordicHamstring => ({
    peakForce: data?.peakForce ?? undefined,
    avgForce: data?.avgForce ?? undefined,
    fatigue: data?.fatigue ?? undefined,
  });

  const [form, setForm] = useState({
    isokineticKnee: initializeIsokineticKnee(initialData?.isokineticKnee),
    isokineticAnkle: initializeIsokineticAnkle(initialData?.isokineticAnkle),
    nordicHamstring: initializeNordicHamstring(initialData?.nordicHamstring),
    assessmentFindings: initialData?.assessmentFindings || "",
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        isokineticKnee: initializeIsokineticKnee(initialData.isokineticKnee),
        isokineticAnkle: initializeIsokineticAnkle(initialData.isokineticAnkle),
        nordicHamstring: initializeNordicHamstring(initialData.nordicHamstring),
        assessmentFindings: initialData.assessmentFindings || "",
      });
    }
  }, [initialData]);

  const updateTestField = useCallback((category: string, field: string, value: string) => {
    const numValue = value === "" ? undefined : parseFloat(value);
    setForm((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category as keyof typeof prev] as any),
        [field]: numValue,
      },
    }));
    setIsSaved(false);
  }, []);

  const handleSave = () => {
    if (onSave) {
      onSave(form);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  // --- Section Configuration ---
  // Includes Protocol/Instrument details from your table
  const sections = [
    {
      title: "Isokinetic Knee",
      category: "isokineticKnee",
      protocol: "Isokinetic dynamometer • 10 reps @60°/s",
      rows: [
        { key: "peakTorque", label: "Peak Torque", unit: "Nm" },
        { key: "power", label: "Power", unit: "W" },
      ],
    },
    {
      title: "Isokinetic Ankle",
      category: "isokineticAnkle",
      protocol: "Isokinetic dynamometer • 10 reps @60°/s",
      rows: [
        { key: "torque", label: "Torque", unit: "Nm" },
        { key: "power", label: "Power", unit: "W" },
      ],
    },
    {
      title: "Nordic Hamstring",
      category: "nordicHamstring",
      protocol: "Nordic bench + KINVENT • 2 Trials",
      rows: [
        { key: "peakForce", label: "Peak Force", unit: "N" },
        { key: "avgForce", label: "Average Force", unit: "N" },
        { key: "fatigue", label: "Fatigue", unit: "%" },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-white">Strength Tests – HumacROM</h3>
        <p className="text-white font-bold text-sm mt-1 font-medium">
          Measure maximal, explosive, and endurance strength across key joints.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.category} className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg">
            
            {/* Section Header with Protocol Info */}
            <div className="mb-4 border-b border-gray-700 pb-3">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold text-white">{section.title}</h4>
                <span className="text-xs font-medium bg-gray-700 text-white font-bold px-2 py-1 rounded border border-gray-600">
                  {section.protocol}
                </span>
              </div>
            </div>

            {/* Input Table */}
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-white font-bold font-bold border-b border-gray-700">
                  <th className="py-3 w-1/2">Parameter</th>
                  <th className="py-3 w-1/2">Values</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {section.rows.map((row) => {
                  const categoryData = form[section.category as keyof typeof form] as any;
                  const value = categoryData[row.key] ?? "";

                  return (
                    <tr key={`${section.category}-${row.key}`}>
                      <td className="py-3 text-white font-bold">
                        {row.label}
                        {row.unit && <span className="text-white font-bold text-xs ml-1">({row.unit})</span>}
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          className="w-full p-2 input-glass font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`Enter ${row.label.toLowerCase()}`}
                          value={value}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || /^\d*\.?\d*$/.test(val)) {
                              updateTestField(section.category, row.key, val);
                            }
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Assessment Findings */}
      <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg">
        <h4 className="text-lg font-bold text-white mb-3">Assessment Findings</h4>
        <textarea
          className="w-full p-3 textarea-glass font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
          rows={4}
          placeholder="Enter detailed notes and findings..."
          value={form.assessmentFindings}
          onChange={(e) => {
            setForm((prev) => ({ ...prev, assessmentFindings: e.target.value }));
            setIsSaved(false);
          }}
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


