"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { calculateDomainStatus, getDomainStatuses, calculateGlobalStatus } from "@/lib/domainStatus";

interface NutritionFormProps {
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
}

const PARAMETER_CONFIG: ParameterConfig[] = [
  {
    id: "warmUpActivity",
    label: "Warm-up activity",
    unit: "Type",
    placeholder: "e.g. Dynamic mobility drills",
  },
  {
    id: "warmUpDuration",
    label: "Duration",
    unit: "min",
    placeholder: "e.g. 10",
  },
  {
    id: "environment",
    label: "Environment",
    unit: "Controlled / Outdoor",
    placeholder: "Select or describe",
  },
  {
    id: "loadConditions",
    label: "Load conditions",
    unit: "UL / LC-1 / LC-2 / LC-3",
    placeholder: "e.g. LC-2",
  },
  {
    id: "restBetweenTests",
    label: "Rest between tests",
    unit: "sec",
    placeholder: "e.g. 60",
  },
];

export default function NutritionForm({
  onBack,
  initialData,
  entryId,
  onDataSaved,
}: NutritionFormProps) {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const sourceData = initialData?.nutrition || initialData || {};
    const mappedValues = PARAMETER_CONFIG.reduce<Record<string, string>>(
      (acc, param) => {
        acc[param.id] = sourceData?.[param.id] ?? "";
        return acc;
      },
      {}
    );
    setFormValues(mappedValues);
  }, [initialData]);

  const handleChange = (id: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    if (!entryId) {
      alert("Please start an entry from the Entries tab before saving Nutrition data.");
      return;
    }

    if (!auth.currentUser) {
      alert("You must be logged in to save data.");
      return;
    }

    setSaving(true);
    try {
      const docRef = doc(db, "physioAssessments", entryId);
      
      // Get existing document to merge all domain data
      let existingData: any = null;
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          existingData = docSnap.data();
        }
      } catch (err) {
        console.warn("Could not fetch existing document:", err);
      }
      
      // Merge updated data with existing data
      const allDomainData = existingData 
        ? { ...existingData, nutrition: formValues }
        : { nutrition: formValues };
      
      // Calculate domain status
      const domainStatus = calculateDomainStatus("Nutrition", allDomainData);
      
      // Get existing domain statuses or calculate from all data
      const existingDomainStatuses = existingData?.domainStatuses;
      let updatedDomainStatuses: any;
      
      if (existingDomainStatuses) {
        updatedDomainStatuses = {
          ...existingDomainStatuses,
          Nutrition: domainStatus
        };
      } else {
        updatedDomainStatuses = getDomainStatuses(allDomainData);
        updatedDomainStatuses.Nutrition = domainStatus;
      }
      
      // Calculate overall patient status
      const patientStatus = calculateGlobalStatus(updatedDomainStatuses);
      
      // Update Firestore with data, domain statuses, and patient status
      await updateDoc(docRef, {
        nutrition: formValues,
        domainStatuses: updatedDomainStatuses,
        status: patientStatus,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser.uid,
      });

      if (onDataSaved) {
        onDataSaved(entryId, { nutrition: formValues });
      }

      alert("Nutrition details saved.");
    } catch (error) {
      console.error("Error saving nutrition data:", error);
      alert("Failed to save nutrition data. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nutrition Assessment</h2>
          <p className="text-sm text-gray-500 mt-1">
            Document warm-up context and load conditions relevant to nutrition protocols.
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Context</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-gray-500 border-b">
              <tr>
                <th className="py-3 text-left font-medium">Parameter</th>
                <th className="py-3 text-left font-medium">Unit / Guidance</th>
                <th className="py-3 text-left font-medium">Enter value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {PARAMETER_CONFIG.map((param) => (
                <tr key={param.id}>
                  <td className="py-4 font-medium text-gray-900">{param.label}</td>
                  <td className="py-4 text-gray-500">{param.unit || "—"}</td>
                  <td className="py-4">
                    <input
                      type="text"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 bg-white focus:border-green-500 focus:ring-green-500"
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
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Nutrition"}
          </button>
        </div>
      </div>
    </div>
  );
}
