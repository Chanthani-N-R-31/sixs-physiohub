"use client";

import { useState, useEffect, useCallback } from "react";

interface PowerTest {
  height?: number;
  peakForce?: number;
  RSI?: number;
  distance?: number;
  asymmetry?: number;
  trials?: number;
}

interface PowerTestsProps {
  initialData?: any;
  onSave?: (data: any) => void;
}

export default function PowerTests({ initialData, onSave }: PowerTestsProps) {
  const tests = [
    { key: "cmj", label: "CMJ" },
    { key: "singleLegCMJ", label: "Single-leg CMJ" },
    { key: "squatJump", label: "Squat Jump" },
    { key: "singleLegSJ", label: "Single-leg Squat Jump" },
    { key: "dropJump", label: "Drop Jump" },
    { key: "standingBroadJump", label: "Standing Broad Jump" },
  ];

  const initializePowerTest = (data?: PowerTest): PowerTest => ({
    height: data?.height ?? undefined,
    peakForce: data?.peakForce ?? undefined,
    RSI: data?.RSI ?? undefined,
    distance: data?.distance ?? undefined,
    asymmetry: data?.asymmetry ?? undefined,
    trials: data?.trials ?? undefined,
  });

  const [form, setForm] = useState({
    cmj: initializePowerTest(initialData?.cmj),
    singleLegCMJ: initializePowerTest(initialData?.singleLegCMJ),
    squatJump: initializePowerTest(initialData?.squatJump),
    singleLegSJ: initializePowerTest(initialData?.singleLegSJ),
    dropJump: initializePowerTest(initialData?.dropJump),
    standingBroadJump: initializePowerTest(initialData?.standingBroadJump),
    assessmentFindings: initialData?.assessmentFindings || "",
  });

  const [isSaved, setIsSaved] = useState(false);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        cmj: initializePowerTest(initialData.cmj),
        singleLegCMJ: initializePowerTest(initialData.singleLegCMJ),
        squatJump: initializePowerTest(initialData.squatJump),
        singleLegSJ: initializePowerTest(initialData.singleLegSJ),
        dropJump: initializePowerTest(initialData.dropJump),
        standingBroadJump: initializePowerTest(initialData.standingBroadJump),
        assessmentFindings: initialData.assessmentFindings || "",
      });
    }
  }, [initialData]);

  // Filter to only allow numbers and decimal point
  const filterNumeric = (value: string): string => {
    return value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
  };

  const updatePowerTestField = useCallback((testKey: string, field: keyof PowerTest, value: string) => {
    const numValue = value === "" ? undefined : parseFloat(value);
    setForm((prev) => ({
      ...prev,
      [testKey]: {
        ...(prev[testKey as keyof typeof prev] as PowerTest),
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
      <h3 className="text-xl font-semibold text-gray-900">Power Tests — Controlled Environment</h3>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <div className="space-y-4">
          {tests.map((test) => {
            const testData = form[test.key as keyof typeof form] as PowerTest;
            const isExpanded = expandedTest === test.key;

            return (
              <div key={test.key} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedTest(isExpanded ? null : test.key)}
                  className="w-full p-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
                >
                  <span className="font-medium text-gray-900">{test.label}</span>
                  <span className="text-gray-600">{isExpanded ? "▼" : "▶"}</span>
                </button>
                
                {isExpanded && (
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Height (cm)</label>
                        <input
                          type="number"
                          step="0.1"
                          className="input-field"
                          placeholder="Enter height"
                          value={testData.height ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || /^\d*\.?\d*$/.test(val)) {
                              updatePowerTestField(test.key, "height", val);
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Peak Force (N)</label>
                        <input
                          type="number"
                          step="0.1"
                          className="input-field"
                          placeholder="Enter peak force"
                          value={testData.peakForce ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || /^\d*\.?\d*$/.test(val)) {
                              updatePowerTestField(test.key, "peakForce", val);
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">RSI</label>
                        <input
                          type="number"
                          step="0.1"
                          className="input-field"
                          placeholder="Enter RSI"
                          value={testData.RSI ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || /^\d*\.?\d*$/.test(val)) {
                              updatePowerTestField(test.key, "RSI", val);
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Distance (cm/m)</label>
                        <input
                          type="number"
                          step="0.1"
                          className="input-field"
                          placeholder="Enter distance"
                          value={testData.distance ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || /^\d*\.?\d*$/.test(val)) {
                              updatePowerTestField(test.key, "distance", val);
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Asymmetry (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          className="input-field"
                          placeholder="Enter asymmetry"
                          value={testData.asymmetry ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || /^\d*\.?\d*$/.test(val)) {
                              updatePowerTestField(test.key, "asymmetry", val);
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
                          value={testData.trials ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || /^\d*$/.test(val)) {
                              updatePowerTestField(test.key, "trials", val);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
