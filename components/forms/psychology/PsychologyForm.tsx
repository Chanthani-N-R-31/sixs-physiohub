"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { calculateDomainStatus, getDomainStatuses, calculateGlobalStatus } from "@/lib/domainStatus";

interface PsychologyFormProps {
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
  trials?: number;
}

const PARAMETER_CONFIG: ParameterConfig[] = [
  {
    id: "stairs",
    label: "Stairs (up/down)",
    unit: "Step / contact time",
    placeholder: "e.g. 0.38s / 0.35s",
    trials: 2,
  },
  {
    id: "turns",
    label: "Turns / slalom",
    unit: "Yaw rate / time loss",
    placeholder: "e.g. 180°/s / +0.8s",
    trials: 2,
  },
  {
    id: "unevenGround",
    label: "Uneven ground",
    unit: "CV% / Harmonic ratio",
    placeholder: "e.g. 4.5% / 2.1",
    trials: 2,
  },
  {
    id: "weaponHandling",
    label: "Weapon handling",
    unit: "Asymmetry / swing",
    placeholder: "e.g. 6% / controlled",
    trials: 1,
  },
];

export default function PsychologyForm({
  onBack,
  initialData,
  entryId,
  onDataSaved,
}: PsychologyFormProps) {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const sourceData = initialData?.psychology || initialData || {};
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
      alert("Please start an entry from the Entries tab before saving Psychology data.");
      return;
    }

    if (!auth.currentUser) {
      alert("You must be logged in to save data.");
      return;
    }

    setSaving(true);
    try {
      const docRef = doc(db, "physioAssessments", entryId);

      let existingData: any = null;
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) existingData = docSnap.data();
      } catch (err) {
        console.warn("Could not fetch existing document:", err);
      }

      const allDomainData = existingData
        ? { ...existingData, psychology: formValues }
        : { psychology: formValues };

      const domainStatus = calculateDomainStatus("Psychology", allDomainData);

      const existingDomainStatuses = existingData?.domainStatuses;
      let updatedDomainStatuses: any;

      if (existingDomainStatuses) {
        updatedDomainStatuses = {
          ...existingDomainStatuses,
          Psychology: domainStatus,
        };
      } else {
        updatedDomainStatuses = getDomainStatuses(allDomainData);
        updatedDomainStatuses.Psychology = domainStatus;
      }

      const patientStatus = calculateGlobalStatus(updatedDomainStatuses);

      await updateDoc(docRef, {
        psychology: formValues,
        domainStatuses: updatedDomainStatuses,
        status: patientStatus,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser.uid,
      });

      if (onDataSaved) {
        onDataSaved(entryId, { psychology: formValues });
      }

      alert("Psychology details saved.");
    } catch (error) {
      console.error("Error saving psychology data:", error);
      alert("Failed to save psychology data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Psychology Assessment</h2>
          <p className="text-sm text-gray-500 mt-1">
            Capture IMU-derived metrics for complex coordination scenarios.
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

      <div className="bg-gray-100 rounded-xl shadow-md p-6 border border-gray-400">
        <h3 className="text-3xl font-bold text-white text-center mb-4">Operational Tasks</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-black border-b border-gray-400">
              <tr>
                <th className="py-3 text-left font-bold">Parameter</th>
                <th className="py-3 text-left font-bold">Unit / Metric</th>
                <th className="py-3 text-left font-bold">Trials</th>
                <th className="py-3 text-left font-bold">Enter value</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-400">
              {PARAMETER_CONFIG.map((param) => (
                <tr key={param.id}>
                  <td className="py-4 font-bold text-black">{param.label}</td>
                  <td className="py-4 text-black">{param.unit || "—"}</td>
                  <td className="py-4 text-black">{param.trials ?? "—"}</td>

                  <td className="py-4">
                    <input
                      type="text"
                      className="
                        w-full rounded-lg border border-gray-400 px-3 py-2 text-sm
                        text-black placeholder-gray-500 bg-white
                        focus:border-blue-500 focus:ring-blue-500
                      "
                      value={formValues[param.id] || ""}
                      onChange={(e) => handleChange(param.id, e.target.value)}
                      placeholder={param.placeholder}
                    />
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
            className="px-6 py-3 bg-gray-300 text-black font-bold rounded-lg hover:bg-gray-400 transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Psychology"}
          </button>
        </div>
      </div>
    </div>
  );
}

