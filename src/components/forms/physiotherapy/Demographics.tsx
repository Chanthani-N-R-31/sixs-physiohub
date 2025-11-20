// src/components/forms/physiotherapy/Demographics.tsx
"use client";

import { useState, useEffect } from "react";

interface BasicDetailsData {
  name: string;
  dob: string;
  serviceNumber: string;
  age: string;
  trainingDepartment: string;
  rank: string;
  dateOfAssessment: string;
  chiefComplaints: string;
}

interface DemographicsProps {
  basicDetailsData?: BasicDetailsData | null;
}

export default function Demographics({
  basicDetailsData,
}: DemographicsProps) {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    contact: "",
    occupation: "",
    activityLevel: "",
    chiefComplaint: "",
  });

  // Auto-populate from Basic Details when available
  useEffect(() => {
    if (basicDetailsData) {
      setForm((prev) => ({
        ...prev,
        name: basicDetailsData.name || prev.name,
        age: basicDetailsData.age || prev.age,
        chiefComplaint: basicDetailsData.chiefComplaints || prev.chiefComplaint,
        occupation: basicDetailsData.rank || prev.occupation,
      }));
    }
  }, [basicDetailsData]);

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      <h3 className="text-xl font-semibold text-gray-900">
        Patient Demographics
      </h3>
      {basicDetailsData && (
        <p className="text-sm text-green-600 bg-green-50 p-2 rounded">
          ✓ Data auto-populated from Basic Details. You can edit as needed.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PATIENT NAME */}
        <div>
          <label className="text-sm font-medium text-gray-900">Patient Name</label>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full p-3 mt-1 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
            placeholder="Enter full name"
          />
        </div>

        {/* AGE */}
        <div>
          <label className="text-sm font-medium text-gray-900">Age</label>
          <input
            type="number"
            value={form.age}
            onChange={(e) => update("age", e.target.value)}
            className="w-full p-3 mt-1 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
            placeholder="Enter age"
          />
        </div>

        {/* GENDER */}
        <div>
          <label className="text-sm font-medium text-gray-900">Gender</label>
          <select
            value={form.gender}
            onChange={(e) => update("gender", e.target.value)}
            className="w-full p-3 mt-1 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>

        {/* CONTACT */}
        <div>
          <label className="text-sm font-medium text-gray-900">Contact Number</label>
          <input
            value={form.contact}
            onChange={(e) => update("contact", e.target.value)}
            className="w-full p-3 mt-1 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
            placeholder="Phone number"
          />
        </div>

        {/* HEIGHT */}
        <div>
          <label className="text-sm font-medium text-gray-900">Height (cm)</label>
          <input
            type="number"
            value={form.height}
            onChange={(e) => update("height", e.target.value)}
            className="w-full p-3 mt-1 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
            placeholder="Height in cm"
          />
        </div>

        {/* WEIGHT */}
        <div>
          <label className="text-sm font-medium text-gray-900">Weight (kg)</label>
          <input
            type="number"
            value={form.weight}
            onChange={(e) => update("weight", e.target.value)}
            className="w-full p-3 mt-1 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
            placeholder="Weight in kg"
          />
        </div>

        {/* OCCUPATION */}
        <div>
          <label className="text-sm font-medium text-gray-900">Occupation</label>
          <input
            value={form.occupation}
            onChange={(e) => update("occupation", e.target.value)}
            className="w-full p-3 mt-1 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
            placeholder="E.g., Nurse, Teacher, Athlete"
          />
        </div>

        {/* ACTIVITY LEVEL */}
        <div>
          <label className="text-sm font-medium text-gray-900">Activity Level</label>
          <select
            value={form.activityLevel}
            onChange={(e) => update("activityLevel", e.target.value)}
            className="w-full p-3 mt-1 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select one</option>
            <option>Sedentary</option>
            <option>Moderately Active</option>
            <option>Highly Active</option>
          </select>
        </div>
      </div>

      {/* CHIEF COMPLAINT */}
      <div>
        <label className="text-sm font-medium text-gray-900">Chief Complaint</label>
        <textarea
          value={form.chiefComplaint}
          onChange={(e) => update("chiefComplaint", e.target.value)}
          className="w-full p-3 mt-1 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          placeholder="Describe the patient's primary issue"
          rows={3}
        />
      </div>
    </div>
  );
}
