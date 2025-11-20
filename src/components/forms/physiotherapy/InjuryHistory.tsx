// src/components/forms/physiotherapy/InjuryHistory.tsx
"use client";

import { useState } from "react";

export default function InjuryHistory() {
  const [form, setForm] = useState({
    injuryMechanism: "",
    onsetDate: "",
    duration: "",
    painNature: "",
    painScale: 0,
    aggravatingFactors: "",
    relievingFactors: "",
    previousTreatment: "",
    medicalHistory: "",
  });

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">
        Injury History
      </h3>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Mechanism of Injury */}
        <div>
          <label className="text-sm font-medium text-gray-900">Mechanism of Injury</label>
          <input
            value={form.injuryMechanism}
            onChange={(e) => update("injuryMechanism", e.target.value)}
            className="w-full p-3 mt-1 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
            placeholder="Eg: Slipped, Twisted ankle, Collision"
          />
        </div>

        {/* Date of Onset */}
        <div>
          <label className="text-sm font-medium text-gray-900">Date of Onset</label>
          <input
            type="date"
            value={form.onsetDate}
            onChange={(e) => update("onsetDate", e.target.value)}
            className="w-full p-3 mt-1 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="text-sm font-medium text-gray-900">Duration</label>
          <input
            value={form.duration}
            onChange={(e) => update("duration", e.target.value)}
            className="w-full p-3 mt-1 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
            placeholder="Eg: 2 weeks, 3 months"
          />
        </div>

        {/* Nature of Pain */}
        <div>
          <label className="text-sm font-medium text-gray-900">Nature of Pain</label>
          <select
            value={form.painNature}
            onChange={(e) => update("painNature", e.target.value)}
            className="w-full p-3 mt-1 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select type</option>
            <option>Sharp</option>
            <option>Dull</option>
            <option>Burning</option>
            <option>Radiating</option>
            <option>Throbbing</option>
            <option>Aching</option>
          </select>
        </div>
      </div>

      {/* PAIN SCALE */}
      <div>
        <label className="text-sm font-medium text-gray-900">Pain Scale (0 - 10)</label>
        <input
          type="range"
          min={0}
          max={10}
          value={form.painScale}
          onChange={(e) => update("painScale", e.target.value)}
          className="w-full mt-2"
        />
        <div className="text-gray-900 font-medium mt-1">
          Current Pain: {form.painScale}/10
        </div>
      </div>

      {/* Aggravating Factors */}
      <div>
        <label className="text-sm font-medium text-gray-900">Aggravating Factors</label>
        <textarea
          value={form.aggravatingFactors}
          onChange={(e) => update("aggravatingFactors", e.target.value)}
          className="w-full p-3 mt-1 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          rows={3}
          placeholder="Movements or activities that increase pain"
        />
      </div>

      {/* Relieving Factors */}
      <div>
        <label className="text-sm font-medium text-gray-900">Relieving Factors</label>
        <textarea
          value={form.relievingFactors}
          onChange={(e) => update("relievingFactors", e.target.value)}
          className="w-full p-3 mt-1 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          rows={3}
          placeholder="Rest, ice, medication, specific positions"
        />
      </div>

      {/* Previous Treatment */}
      <div>
        <label className="text-sm font-medium text-gray-900">Previous Treatment</label>
        <textarea
          value={form.previousTreatment}
          onChange={(e) => update("previousTreatment", e.target.value)}
          className="w-full p-3 mt-1 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          rows={3}
          placeholder="Physiotherapy, medications, surgery, etc."
        />
      </div>

      {/* Medical History */}
      <div>
        <label className="text-sm font-medium text-gray-900">Relevant Medical History</label>
        <textarea
          value={form.medicalHistory}
          onChange={(e) => update("medicalHistory", e.target.value)}
          className="w-full p-3 mt-1 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          rows={3}
          placeholder="Eg: Diabetes, Hypertension, Previous injuries"
        />
      </div>
    </div>
  );
}
