// src/components/forms/physiotherapy/BasicDetails.tsx
"use client";

import { useState } from "react";

interface BasicDetailsProps {
  initialData?: {
    name: string;
    dob: string;
    serviceNumber: string;
    age: string;
    trainingDepartment: string;
    rank: string;
    dateOfAssessment: string;
    chiefComplaints: string;
  };
  onSave?: (data: {
    name: string;
    dob: string;
    serviceNumber: string;
    age: string;
    trainingDepartment: string;
    rank: string;
    dateOfAssessment: string;
    chiefComplaints: string;
  }) => void;
}

export default function BasicDetails({
  initialData,
  onSave,
}: BasicDetailsProps) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    dob: initialData?.dob || "",
    serviceNumber: initialData?.serviceNumber || "",
    age: initialData?.age || "",
    trainingDepartment: initialData?.trainingDepartment || "",
    rank: initialData?.rank || "",
    dateOfAssessment: initialData?.dateOfAssessment || "",
    chiefComplaints: initialData?.chiefComplaints || "",
  });

  const [isSaved, setIsSaved] = useState(false);

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsSaved(false);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(form);
      setIsSaved(true);
    }
  };

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 uppercase">
          BASIC DETAILS
        </h3>
      </div>

      {/* Two-column table layout */}
      <div className="border border-gray-300 overflow-x-auto -mx-6 px-6">
        <table className="w-full border-collapse min-w-[500px]">
          <tbody>
            {/* Name */}
            <tr className="border-b border-gray-300">
              <td className="w-1/3 p-3 border-r border-gray-300 bg-gray-50">
                <label className="text-sm font-medium text-gray-900">Name</label>
              </td>
              <td className="w-2/3 p-3">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter name"
                />
              </td>
            </tr>

            {/* DOB */}
            <tr className="border-b border-gray-300">
              <td className="w-1/3 p-3 border-r border-gray-300 bg-gray-50">
                <label className="text-sm font-medium text-gray-900">
                  DOB (DD/MM/YYYY)
                </label>
              </td>
              <td className="w-2/3 p-3">
                <input
                  type="text"
                  value={form.dob}
                  onChange={(e) => update("dob", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="DD/MM/YYYY"
                />
              </td>
            </tr>

            {/* Service Number */}
            <tr className="border-b border-gray-300">
              <td className="w-1/3 p-3 border-r border-gray-300 bg-gray-50">
                <label className="text-sm font-medium text-gray-900">
                  Service Number
                </label>
              </td>
              <td className="w-2/3 p-3">
                <input
                  type="text"
                  value={form.serviceNumber}
                  onChange={(e) => update("serviceNumber", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter service number"
                />
              </td>
            </tr>

            {/* Age */}
            <tr className="border-b border-gray-300">
              <td className="w-1/3 p-3 border-r border-gray-300 bg-gray-50">
                <label className="text-sm font-medium text-gray-900">Age</label>
              </td>
              <td className="w-2/3 p-3">
                <input
                  type="text"
                  value={form.age}
                  onChange={(e) => update("age", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter age"
                />
              </td>
            </tr>

            {/* Training Department */}
            <tr className="border-b border-gray-300">
              <td className="w-1/3 p-3 border-r border-gray-300 bg-gray-50">
                <label className="text-sm font-medium text-gray-900">
                  Training Department
                </label>
              </td>
              <td className="w-2/3 p-3">
                <input
                  type="text"
                  value={form.trainingDepartment}
                  onChange={(e) => update("trainingDepartment", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter training department"
                />
              </td>
            </tr>

            {/* Rank */}
            <tr className="border-b border-gray-300">
              <td className="w-1/3 p-3 border-r border-gray-300 bg-gray-50">
                <label className="text-sm font-medium text-gray-900">Rank</label>
              </td>
              <td className="w-2/3 p-3">
                <input
                  type="text"
                  value={form.rank}
                  onChange={(e) => update("rank", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter rank"
                />
              </td>
            </tr>

            {/* Date of Assessment */}
            <tr className="border-b border-gray-300">
              <td className="w-1/3 p-3 border-r border-gray-300 bg-gray-50">
                <label className="text-sm font-medium text-gray-900">
                  Date of Assessment (DD/MM/YYYY)
                </label>
              </td>
              <td className="w-2/3 p-3">
                <input
                  type="text"
                  value={form.dateOfAssessment}
                  onChange={(e) => update("dateOfAssessment", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="DD/MM/YYYY"
                />
              </td>
            </tr>

            {/* Chief Complaints */}
            <tr>
              <td className="w-1/3 p-3 border-r border-gray-300 bg-gray-50 align-top">
                <label className="text-sm font-medium text-gray-900">
                  Chief Complaints
                </label>
              </td>
              <td className="w-2/3 p-3">
                <textarea
                  value={form.chiefComplaints}
                  onChange={(e) => update("chiefComplaints", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={5}
                  placeholder="Enter chief complaints"
                />
              </td>
            </tr>
          </tbody>
        </table>
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
          Save Basic Details
        </button>
      </div>
    </div>
  );
}

