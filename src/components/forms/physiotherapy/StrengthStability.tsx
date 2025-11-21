// src/components/forms/physiotherapy/StrengthStability.tsx
"use client";

import { useState } from "react";

export default function StrengthStability() {
  const [data, setData] = useState({
    // CORE
    plankTime: "",
    sidePlankL: "",
    sidePlankR: "",
    coreNotes: "",

    // BALANCE
    staticBalance: "",
    dynamicBalance: "",
    balanceNotes: "",
  });

  const u = (key: string, val: string) => {
    setData((p) => ({ ...p, [key]: val }));
  };

  return (
    <div className="space-y-10">
      <h3 className="text-xl font-semibold text-gray-900">Strength & Stability</h3>

      {/* ===================== CORE SECTION ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Core Stability</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-900">Plank Hold Time (seconds)</label>
            <input
              value={data.plankTime}
              onChange={(e) => u("plankTime", e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500"
              placeholder="Eg: 45 sec"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-900">Side Plank - Left (seconds)</label>
            <input
              value={data.sidePlankL}
              onChange={(e) => u("sidePlankL", e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-900">Side Plank - Right (seconds)</label>
            <input
              value={data.sidePlankR}
              onChange={(e) => u("sidePlankR", e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500"
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
    </div>
  );
}
