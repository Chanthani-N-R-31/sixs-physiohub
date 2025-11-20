// src/components/forms/physiotherapy/StrengthStability.tsx
"use client";

import { useState } from "react";

export default function StrengthStability() {
  const [data, setData] = useState({
    // MMT (Manual Muscle Testing)
    shoulderFlexL: "",
    shoulderFlexR: "",
    shoulderAbdL: "",
    shoulderAbdR: "",
    elbowFlexL: "",
    elbowFlexR: "",
    elbowExtL: "",
    elbowExtR: "",

    hipFlexL: "",
    hipFlexR: "",
    hipAbdL: "",
    hipAbdR: "",
    kneeFlexL: "",
    kneeFlexR: "",
    kneeExtL: "",
    kneeExtR: "",

    ankleDFL: "",
    ankleDFR: "",
    anklePFL: "",
    anklePFR: "",

    // CORE
    plankTime: "",
    sidePlankL: "",
    sidePlankR: "",
    coreNotes: "",

    // BALANCE
    staticBalance: "",
    dynamicBalance: "",
    balanceNotes: "",

    // SPECIAL TESTS
    resistanceTests: "",
  });

  const u = (key: string, val: string) => {
    setData((p) => ({ ...p, [key]: val }));
  };

  // Drop-down for MMT score (0–5)
  const MMTSelect = ({ value, onChange }: any) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
    >
      <option value="">--</option>
      <option value="0">0 - No Contraction</option>
      <option value="1">1 - Trace</option>
      <option value="2">2 - Poor</option>
      <option value="3">3 - Fair</option>
      <option value="4">4 - Good</option>
      <option value="5">5 - Normal</option>
    </select>
  );

  return (
    <div className="space-y-10">
      <h3 className="text-xl font-semibold text-gray-900">Strength & Stability</h3>

      {/* ===================== MMT SECTION ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">
          Manual Muscle Testing (MMT)
          <span className="block text-sm text-gray-500 mt-1">Score: 0 – 5</span>
        </h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2">Movement</th>
              <th className="py-2">Left</th>
              <th className="py-2">Right</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {/* Shoulder */}
            <tr>
              <td className="py-2">Shoulder Flexion</td>
              <td><MMTSelect value={data.shoulderFlexL} onChange={(v: any) => u("shoulderFlexL", v)} /></td>
              <td><MMTSelect value={data.shoulderFlexR} onChange={(v: any) => u("shoulderFlexR", v)} /></td>
            </tr>

            <tr>
              <td>Shoulder Abduction</td>
              <td><MMTSelect value={data.shoulderAbdL} onChange={(v: any) => u("shoulderAbdL", v)} /></td>
              <td><MMTSelect value={data.shoulderAbdR} onChange={(v: any) => u("shoulderAbdR", v)} /></td>
            </tr>

            {/* Elbow */}
            <tr>
              <td>Elbow Flexion</td>
              <td><MMTSelect value={data.elbowFlexL} onChange={(v: any) => u("elbowFlexL", v)} /></td>
              <td><MMTSelect value={data.elbowFlexR} onChange={(v: any) => u("elbowFlexR", v)} /></td>
            </tr>

            <tr>
              <td>Elbow Extension</td>
              <td><MMTSelect value={data.elbowExtL} onChange={(v: any) => u("elbowExtL", v)} /></td>
              <td><MMTSelect value={data.elbowExtR} onChange={(v: any) => u("elbowExtR", v)} /></td>
            </tr>

            {/* Hip */}
            <tr>
              <td>Hip Flexion</td>
              <td><MMTSelect value={data.hipFlexL} onChange={(v: any) => u("hipFlexL", v)} /></td>
              <td><MMTSelect value={data.hipFlexR} onChange={(v: any) => u("hipFlexR", v)} /></td>
            </tr>

            <tr>
              <td>Hip Abduction</td>
              <td><MMTSelect value={data.hipAbdL} onChange={(v: any) => u("hipAbdL", v)} /></td>
              <td><MMTSelect value={data.hipAbdR} onChange={(v: any) => u("hipAbdR", v)} /></td>
            </tr>

            {/* Knee */}
            <tr>
              <td>Knee Flexion</td>
              <td><MMTSelect value={data.kneeFlexL} onChange={(v: any) => u("kneeFlexL", v)} /></td>
              <td><MMTSelect value={data.kneeFlexR} onChange={(v: any) => u("kneeFlexR", v)} /></td>
            </tr>

            <tr>
              <td>Knee Extension</td>
              <td><MMTSelect value={data.kneeExtL} onChange={(v: any) => u("kneeExtL", v)} /></td>
              <td><MMTSelect value={data.kneeExtR} onChange={(v: any) => u("kneeExtR", v)} /></td>
            </tr>

            {/* Ankle */}
            <tr>
              <td>Ankle Dorsiflexion</td>
              <td><MMTSelect value={data.ankleDFL} onChange={(v: any) => u("ankleDFL", v)} /></td>
              <td><MMTSelect value={data.ankleDFR} onChange={(v: any) => u("ankleDFR", v)} /></td>
            </tr>

            <tr>
              <td>Ankle Plantarflexion</td>
              <td><MMTSelect value={data.anklePFL} onChange={(v: any) => u("anklePFL", v)} /></td>
              <td><MMTSelect value={data.anklePFR} onChange={(v: any) => u("anklePFR", v)} /></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===================== CORE SECTION ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Core Stability</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-900">Plank Hold Time (seconds)</label>
            <input
              value={data.plankTime}
              onChange={(e) => u("plankTime", e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              placeholder="Eg: 45 sec"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-900">Side Plank - Left (seconds)</label>
            <input
              value={data.sidePlankL}
              onChange={(e) => u("sidePlankL", e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-900">Side Plank - Right (seconds)</label>
            <input
              value={data.sidePlankR}
              onChange={(e) => u("sidePlankR", e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-900">Notes</label>
          <textarea
            value={data.coreNotes}
            onChange={(e) => u("coreNotes", e.target.value)}
            className="w-full p-3 mt-1 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
            rows={3}
            placeholder="Weak core, compensations, shaking, alignment issues..."
          />
        </div>
      </section>

      {/* ===================== BALANCE SECTION ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Balance Assessment</h4>

        <div>
          <label className="text-sm font-medium text-gray-900">Static Balance</label>
          <select
            value={data.staticBalance}
            onChange={(e) => u("staticBalance", e.target.value)}
            className="w-full mt-2 p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select</option>
            <option>Good</option>
            <option>Fair</option>
            <option>Poor</option>
          </select>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-900">Dynamic Balance</label>
          <select
            value={data.dynamicBalance}
            onChange={(e) => u("dynamicBalance", e.target.value)}
            className="w-full mt-2 p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          >
            <option value="">Select</option>
            <option>Good</option>
            <option>Fair</option>
            <option>Poor</option>
          </select>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-900">Balance Notes</label>
          <textarea
            value={data.balanceNotes}
            onChange={(e) => u("balanceNotes", e.target.value)}
            className="w-full p-3 mt-1 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
            rows={3}
            placeholder="SLS time, wobble, stability issues..."
          />
        </div>
      </section>

      {/* ===================== SPECIAL TESTS ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Special Resistance Tests</h4>

        <textarea
          value={data.resistanceTests}
          onChange={(e) => u("resistanceTests", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          rows={4}
          placeholder="Eg: Thomas test, Ober test, Empty can, Y-balance, etc."
        />
      </section>
    </div>
  );
}
