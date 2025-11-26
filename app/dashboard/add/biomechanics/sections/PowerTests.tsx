"use client";

import { useState, useEffect, useCallback } from "react";

interface PowerProps {
  initialData?: any;
  onSave?: (data: any) => void;
}

// Interfaces based on the specific Power Test parameters
interface CMJ {
  height?: number;
  peakForce?: number;
  rsi?: number;
}

interface SingleLegCMJ {
  height?: number;
  force?: number;
  asymmetry?: number;
}

interface SquatJump {
  height?: number;
  peakForce?: number;
  power?: number;
}

interface SingleLegSJ {
  height?: number;
  force?: number;
  asymmetry?: number;
}

interface DropJump {
  height?: number;
  contactTime?: number;
  rsi?: number;
}

interface BroadJump {
  distance?: number;
}

export default function Power({ initialData, onSave }: PowerProps) {
  // --- Data Initialization ---
  // Helper to ensure all fields exist even if initialData is partial
  const init = (data: any, keys: string[]) => {
    const obj: any = {};
    keys.forEach(key => obj[key] = data?.[key] ?? undefined);
    return obj;
  };

  const [form, setForm] = useState({
    cmj: init(initialData?.cmj, ["height", "peakForce", "rsi"]),
    slCmj: init(initialData?.slCmj, ["height", "force", "asymmetry"]),
    squatJump: init(initialData?.squatJump, ["height", "peakForce", "power"]),
    slSj: init(initialData?.slSj, ["height", "force", "asymmetry"]),
    dropJump: init(initialData?.dropJump, ["height", "contactTime", "rsi"]),
    broadJump: init(initialData?.broadJump, ["distance"]),
    assessmentFindings: initialData?.assessmentFindings || "",
  });

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        cmj: init(initialData.cmj, ["height", "peakForce", "rsi"]),
        slCmj: init(initialData.slCmj, ["height", "force", "asymmetry"]),
        squatJump: init(initialData.squatJump, ["height", "peakForce", "power"]),
        slSj: init(initialData.slSj, ["height", "force", "asymmetry"]),
        dropJump: init(initialData.dropJump, ["height", "contactTime", "rsi"]),
        broadJump: init(initialData.broadJump, ["distance"]),
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
  // Defines the structure, titles, and protocol info for each test
  const sections = [
    {
      title: "CMJ (Countermovement Jump)",
      category: "cmj",
      protocol: "Force plate / IMU • 3 Trials",
      rows: [
        { key: "height", label: "Jump Height", unit: "cm" },
        { key: "peakForce", label: "Peak Force", unit: "N" },
        { key: "rsi", label: "RSI", unit: "index" },
      ],
    },
    {
      title: "Single-leg CMJ",
      category: "slCmj",
      protocol: "Force plate / IMU • 2 Trials",
      rows: [
        { key: "height", label: "Height", unit: "cm" },
        { key: "force", label: "Force", unit: "N" },
        { key: "asymmetry", label: "Asymmetry", unit: "%" },
      ],
    },
    {
      title: "Squat Jump",
      category: "squatJump",
      protocol: "Force plate / IMU • 3 Trials",
      rows: [
        { key: "height", label: "Height", unit: "cm" },
        { key: "peakForce", label: "Peak Force", unit: "N" },
        { key: "power", label: "Power", unit: "W" },
      ],
    },
    {
      title: "Single-leg SJ",
      category: "slSj",
      protocol: "Force plate / IMU • 2 Trials",
      rows: [
        { key: "height", label: "Height", unit: "cm" },
        { key: "force", label: "Force", unit: "N" },
        { key: "asymmetry", label: "Asymmetry", unit: "%" },
      ],
    },
    {
      title: "Drop Jump",
      category: "dropJump",
      protocol: "Force plate / IMU • 2 Trials",
      rows: [
        { key: "height", label: "Height", unit: "cm" },
        { key: "contactTime", label: "Contact Time", unit: "ms" },
        { key: "rsi", label: "RSI", unit: "index" },
      ],
    },
    {
      title: "Standing Broad Jump",
      category: "broadJump",
      protocol: "Tape measure • 2 Trials",
      rows: [
        { key: "distance", label: "Distance", unit: "cm" },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">Power Tests – Controlled Environment</h3>
        <p className="text-gray-500 text-sm mt-1">
          Assess neuromuscular explosiveness and elastic energy utilization using vertical and horizontal jumps.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.category} className="bg-white p-5 rounded-xl border border-gray-200 shadow-md">
            
            {/* Section Header with Protocol Info */}
            <div className="mb-4 border-b border-gray-100 pb-3">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-800">{section.title}</h4>
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {section.protocol}
                </span>
              </div>
            </div>

            {/* Input Table */}
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-700 font-medium">
                  <th className="py-2 w-1/2">Parameter</th>
                  <th className="py-2 w-1/2">Values</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {section.rows.map((row) => {
                  const categoryData = form[section.category as keyof typeof form] as any;
                  const value = categoryData[row.key] ?? "";

                  return (
                    <tr key={`${section.category}-${row.key}`}>
                      <td className="py-2 text-gray-900">
                        {row.label}
                        {row.unit && <span className="text-gray-400 text-xs ml-1">({row.unit})</span>}
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.1"
                          className="input-field"
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
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Assessment Findings</h4>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical"
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