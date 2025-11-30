"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

interface PhysiologyFormProps {
  onBack?: () => void;
  initialData?: any;
  entryId?: string | null;
  onDataSaved?: (entryId: string, data: any) => void;
}

interface ParameterConfig {
  id: string;
  label: string;
  unit?: string;
  placeholder?: string;
  multiline?: boolean;
}

const PARAMETER_CONFIG: ParameterConfig[] = [
  {
    id: "imuSensorsUsed",
    label: "IMU Sensors used",
    unit: "Positions",
    placeholder: "Foot, Tibia, Sacrum, Sternum, Head",
    multiline: true,
  },
  {
    id: "samplingRate",
    label: "Sampling rate",
    unit: "Hz",
    placeholder: "e.g. 250",
  },
  {
    id: "measurementRange",
    label: "Range",
    unit: "±g / ±°/s",
    placeholder: "e.g. ±16g / ±2000°/s",
  },
  {
    id: "calibrationType",
    label: "Calibration type",
    placeholder: "Static / Dynamic",
  },
  {
    id: "mountingMethod",
    label: "Mounting method",
    placeholder: "Tape / Clip / Sleeve",
  },
  {
    id: "syncMethod",
    label: "Sync method",
    placeholder: "Tap / Trigger / Timestamp",
  },
];

export default function PhysiologyForm({
  onBack,
  initialData,
  entryId,
  onDataSaved,
}: PhysiologyFormProps) {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const sourceData = initialData?.physiology || initialData || {};
    const mappedValues = PARAMETER_CONFIG.reduce<Record<string, string>>((acc, param) => {
      acc[param.id] = sourceData?.[param.id] ?? "";
      return acc;
    }, {});
    setFormValues(mappedValues);
  }, [initialData]);

  const handleChange = (id: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    if (!entryId) {
      alert("Please start an entry from the Entries tab before saving Physiology data.");
      return;
    }

    if (!auth.currentUser) {
      alert("You must be logged in to save data.");
      return;
    }

    setSaving(true);
    try {
      const docRef = doc(db, "physioAssessments", entryId);
      await updateDoc(docRef, {
        physiology: formValues,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser.uid,
      });

      if (onDataSaved) {
        onDataSaved(entryId, { physiology: formValues });
      }

      alert("Physiology details saved.");
    } catch (error) {
      console.error("Error saving physiology data:", error);
      alert("Failed to save physiology data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Physiology Assessment</h2>
          <p className="text-sm text-gray-500 mt-1">
            Capture IMU configuration details before running physiology trials.
          </p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            ← Back
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">IMU Setup</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-gray-500 border-b">
              <tr>
                <th className="py-3 text-left font-medium">Parameter</th>
                <th className="py-3 text-left font-medium">Unit</th>
                <th className="py-3 text-left font-medium">Enter value</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {PARAMETER_CONFIG.map((param) => (
                <tr key={param.id}>
                  <td className="py-4 font-medium text-gray-900">{param.label}</td>
                  <td className="py-4 text-gray-500">{param.unit || "—"}</td>

                  <td className="py-4">
                    {param.multiline ? (
                      <textarea
                        className="
                          w-full rounded-lg border border-gray-300 px-3 py-2 text-sm 
                          text-gray-900 placeholder-gray-400 bg-white
                          focus:border-green-500 focus:ring-green-500
                        "
                        rows={2}
                        value={formValues[param.id] || ""}
                        onChange={(e) => handleChange(param.id, e.target.value)}
                        placeholder={param.placeholder}
                      />
                    ) : (
                      <input
                        type="text"
                        className="
                          w-full rounded-lg border border-gray-300 px-3 py-2 text-sm 
                          text-gray-900 placeholder-gray-400 bg-white
                          focus:border-green-500 focus:ring-green-500
                        "
                        value={formValues[param.id] || ""}
                        onChange={(e) => handleChange(param.id, e.target.value)}
                        placeholder={param.placeholder}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Physiology"}
          </button>
        </div>
      </div>
    </div>
  );
}
