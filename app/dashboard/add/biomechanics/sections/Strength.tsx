"use client";

import { useState, useEffect, useCallback } from "react";

interface StrengthProps {
  initialData?: any;
  onSave?: (data: any) => void;
}

interface IsokineticKnee {
  peakTorque?: number;
  power?: number;
  reps?: number;
  velocity?: number;
}

interface IsokineticAnkle {
  torque?: number;
  power?: number;
  reps?: number;
  velocity?: number;
}

interface NordicHamstring {
  peakForce?: number;
  avgForce?: number;
  fatigueIndex?: number;
  trials?: number;
}

export default function Strength({ initialData, onSave }: StrengthProps) {
  const initializeIsokineticKnee = (data?: IsokineticKnee): IsokineticKnee => ({
    peakTorque: data?.peakTorque ?? undefined,
    power: data?.power ?? undefined,
    reps: data?.reps ?? undefined,
    velocity: data?.velocity ?? undefined,
  });

  const initializeIsokineticAnkle = (data?: IsokineticAnkle): IsokineticAnkle => ({
    torque: data?.torque ?? undefined,
    power: data?.power ?? undefined,
    reps: data?.reps ?? undefined,
    velocity: data?.velocity ?? undefined,
  });

  const initializeNordicHamstring = (data?: NordicHamstring): NordicHamstring => ({
    peakForce: data?.peakForce ?? undefined,
    avgForce: data?.avgForce ?? undefined,
    fatigueIndex: data?.fatigueIndex ?? undefined,
    trials: data?.trials ?? undefined,
  });

  const [form, setForm] = useState({
    isokineticKnee: initializeIsokineticKnee(initialData?.isokineticKnee),
    isokineticAnkle: initializeIsokineticAnkle(initialData?.isokineticAnkle),
    nordicHamstring: initializeNordicHamstring(initialData?.nordicHamstring),
    assessmentFindings: initialData?.assessmentFindings || "",
  });

  const [isSaved, setIsSaved] = useState(false);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);

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

  const updateTestField = useCallback((testKey: string, field: string, value: string) => {
    const numValue = value === "" ? undefined : parseFloat(value);
    setForm((prev) => ({
      ...prev,
      [testKey]: {
        ...(prev[testKey as keyof typeof prev] as any),
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

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900">Strength Tests – HumacROM</h3>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <div className="space-y-4">
          {/* Isokinetic Knee */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedTest(expandedTest === "isokineticKnee" ? null : "isokineticKnee")}
              className="w-full p-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
            >
              <span className="font-medium text-gray-900">Isokinetic Knee — Peak torque / Power</span>
              <span className="text-gray-600">{expandedTest === "isokineticKnee" ? "▼" : "▶"}</span>
            </button>
            
            {expandedTest === "isokineticKnee" && (
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Peak Torque</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-field"
                      placeholder="Enter peak torque"
                      value={form.isokineticKnee.peakTorque ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*\.?\d*$/.test(val)) {
                          updateTestField("isokineticKnee", "peakTorque", val);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Power</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-field"
                      placeholder="Enter power"
                      value={form.isokineticKnee.power ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*\.?\d*$/.test(val)) {
                          updateTestField("isokineticKnee", "power", val);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Reps</label>
                    <input
                      type="number"
                      step="1"
                      className="input-field"
                      placeholder="Enter reps"
                      value={form.isokineticKnee.reps ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*$/.test(val)) {
                          updateTestField("isokineticKnee", "reps", val);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Velocity</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-field"
                      placeholder="Enter velocity"
                      value={form.isokineticKnee.velocity ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*\.?\d*$/.test(val)) {
                          updateTestField("isokineticKnee", "velocity", val);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Isokinetic Ankle */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedTest(expandedTest === "isokineticAnkle" ? null : "isokineticAnkle")}
              className="w-full p-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
            >
              <span className="font-medium text-gray-900">Isokinetic Ankle — Torque / Power</span>
              <span className="text-gray-600">{expandedTest === "isokineticAnkle" ? "▼" : "▶"}</span>
            </button>
            
            {expandedTest === "isokineticAnkle" && (
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Torque</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-field"
                      placeholder="Enter torque"
                      value={form.isokineticAnkle.torque ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*\.?\d*$/.test(val)) {
                          updateTestField("isokineticAnkle", "torque", val);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Power</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-field"
                      placeholder="Enter power"
                      value={form.isokineticAnkle.power ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*\.?\d*$/.test(val)) {
                          updateTestField("isokineticAnkle", "power", val);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Reps</label>
                    <input
                      type="number"
                      step="1"
                      className="input-field"
                      placeholder="Enter reps"
                      value={form.isokineticAnkle.reps ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*$/.test(val)) {
                          updateTestField("isokineticAnkle", "reps", val);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Velocity</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-field"
                      placeholder="Enter velocity"
                      value={form.isokineticAnkle.velocity ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*\.?\d*$/.test(val)) {
                          updateTestField("isokineticAnkle", "velocity", val);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Nordic Hamstring */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedTest(expandedTest === "nordicHamstring" ? null : "nordicHamstring")}
              className="w-full p-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
            >
              <span className="font-medium text-gray-900">Nordic Hamstring — Force / Fatigue</span>
              <span className="text-gray-600">{expandedTest === "nordicHamstring" ? "▼" : "▶"}</span>
            </button>
            
            {expandedTest === "nordicHamstring" && (
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Peak Force</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-field"
                      placeholder="Enter peak force"
                      value={form.nordicHamstring.peakForce ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*\.?\d*$/.test(val)) {
                          updateTestField("nordicHamstring", "peakForce", val);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Average Force</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-field"
                      placeholder="Enter average force"
                      value={form.nordicHamstring.avgForce ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*\.?\d*$/.test(val)) {
                          updateTestField("nordicHamstring", "avgForce", val);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Fatigue Index</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-field"
                      placeholder="Enter fatigue index"
                      value={form.nordicHamstring.fatigueIndex ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*\.?\d*$/.test(val)) {
                          updateTestField("nordicHamstring", "fatigueIndex", val);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Trials</label>
                    <input
                      type="number"
                      step="1"
                      className="input-field"
                      placeholder="Enter number of trials"
                      value={form.nordicHamstring.trials ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || /^\d*$/.test(val)) {
                          updateTestField("nordicHamstring", "trials", val);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assessment Findings */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Assessment Findings</h4>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical"
          rows={4}
          placeholder="Enter assessment findings"
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
