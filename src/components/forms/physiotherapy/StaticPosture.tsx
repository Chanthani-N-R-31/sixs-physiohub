// src/components/forms/physiotherapy/StaticPosture.tsx
"use client";

import { useState } from "react";

export default function StaticPosture() {
  const [form, setForm] = useState({
    standingPosture: "",
    sittingPosture: "",
    headAlignment: "",
    shoulderLevel: "",
    scapulaPosition: "",
    pelvisTilt: "",
    kneeAlignment: "",
    footPosture: "",
    observations: "",
  });

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">
        Static Posture Assessment
      </h3>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Standing Posture */}
        <div>
          <label className="text-sm font-medium text-gray-900">Standing Posture</label>
          <select
            value={form.standingPosture}
            onChange={(e) => update("standingPosture", e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select</option>
            <option>Normal</option>
            <option>Forward Lean</option>
            <option>Backward Lean</option>
            <option>Lateral Shift</option>
            <option>Kyphotic</option>
            <option>Lordotic</option>
            <option>Sway Back</option>
          </select>
        </div>

        {/* Sitting Posture */}
        <div>
          <label className="text-sm font-medium text-gray-900">Sitting Posture</label>
          <select
            value={form.sittingPosture}
            onChange={(e) => update("sittingPosture", e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select</option>
            <option>Upright</option>
            <option>Slouched</option>
            <option>Rounded Shoulders</option>
            <option>Forward Head</option>
          </select>
        </div>

        {/* Head/Neck Alignment */}
        <div>
          <label className="text-sm font-medium text-gray-900">Head / Neck Alignment</label>
          <select
            value={form.headAlignment}
            onChange={(e) => update("headAlignment", e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select</option>
            <option>Neutral</option>
            <option>Forward Head</option>
            <option>Side Tilt</option>
            <option>Protracted</option>
          </select>
        </div>

        {/* Shoulder Level */}
        <div>
          <label className="text-sm font-medium text-gray-900">Shoulder Level</label>
          <select
            value={form.shoulderLevel}
            onChange={(e) => update("shoulderLevel", e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select</option>
            <option>Even</option>
            <option>Right Elevated</option>
            <option>Left Elevated</option>
          </select>
        </div>

        {/* Scapular Position */}
        <div>
          <label className="text-sm font-medium text-gray-900">Scapular Position</label>
          <select
            value={form.scapulaPosition}
            onChange={(e) => update("scapulaPosition", e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select</option>
            <option>Neutral</option>
            <option>Winging</option>
            <option>Protracted</option>
            <option>Retracted</option>
          </select>
        </div>

        {/* Pelvic Tilt */}
        <div>
          <label className="text-sm font-medium text-gray-900">Pelvic Tilt</label>
          <select
            value={form.pelvisTilt}
            onChange={(e) => update("pelvisTilt", e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select</option>
            <option>Neutral</option>
            <option>Anterior Tilt</option>
            <option>Posterior Tilt</option>
          </select>
        </div>

        {/* Knee Alignment */}
        <div>
          <label className="text-sm font-medium text-gray-900">Knee Alignment</label>
          <select
            value={form.kneeAlignment}
            onChange={(e) => update("kneeAlignment", e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select</option>
            <option>Neutral</option>
            <option>Genu Varum (Bow Legs)</option>
            <option>Genu Valgum (Knock Knees)</option>
            <option>Genu Recurvatum (Hyperextension)</option>
          </select>
        </div>

        {/* Foot Posture */}
        <div>
          <label className="text-sm font-medium text-gray-900">Foot Posture</label>
          <select
            value={form.footPosture}
            onChange={(e) => update("footPosture", e.target.value)}
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select</option>
            <option>Neutral</option>
            <option>Pronated</option>
            <option>Supinated</option>
          </select>
        </div>
      </div>

      {/* Observations */}
      <div>
        <label className="text-sm font-medium text-gray-900">Additional Observations</label>
        <textarea
          value={form.observations}
          onChange={(e) => update("observations", e.target.value)}
          className="w-full p-3 mt-1 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          rows={3}
          placeholder="Describe any visible asymmetries, compensations, or abnormal posture patterns"
        />
      </div>
    </div>
  );
}
