// src/components/forms/physiotherapy/FMS.tsx
"use client";

import { useState, useMemo } from "react";

export default function FMS() {
  const [form, setForm] = useState({
    // Deep Squat
    deepSquat: "",

    // Hurdle Step
    hurdleL: "",
    hurdleR: "",

    // Inline Lunge
    lungeL: "",
    lungeR: "",

    // Shoulder Mobility
    shoulderMobL: "",
    shoulderMobR: "",
    clearingTestShoulder: "",

    // ASLR
    aslrL: "",
    aslrR: "",

    // Trunk Stability
    trunkStability: "",
    clearingTestTrunk: "",

    // Rotary Stability
    rotaryL: "",
    rotaryR: "",
  });

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // FMS Score Options (0–3)
  const ScoreSelect = ({ value, onChange }: any) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
    >
      <option value="">--</option>
      <option value="3">3 - Performs correctly</option>
      <option value="2">2 - With compensation</option>
      <option value="1">1 - Unable / poor</option>
      <option value="0">0 - Pain</option>
    </select>
  );

  // Total Score Calculation
  const totalScore = useMemo(() => {
    const numericValues = Object.values(form)
      .filter((v) => v !== "")
      .map((v) => Number(v));

    return numericValues.reduce((sum, n) => sum + n, 0);
  }, [form]);

  return (
    <div className="space-y-10">
      <h3 className="text-xl font-semibold text-gray-900">Functional Movement Screening (FMS)</h3>

      {/* ===================== DEEP SQUAT ====================== */}
      <section className="p-4 bg-white rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">1. Deep Squat</h4>

        <ScoreSelect
          value={form.deepSquat}
          onChange={(v: any) => update("deepSquat", v)}
        />
      </section>

      {/* ===================== HURDLE STEP ====================== */}
      <section className="p-4 bg-white rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">2. Hurdle Step</h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2">Side</th>
              <th className="py-2">Score</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="py-2">Left</td>
              <td><ScoreSelect value={form.hurdleL} onChange={(v: any) => update("hurdleL", v)} /></td>
            </tr>
            <tr>
              <td>Right</td>
              <td><ScoreSelect value={form.hurdleR} onChange={(v: any) => update("hurdleR", v)} /></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===================== INLINE LUNGE ====================== */}
      <section className="p-4 bg-white rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">3. Inline Lunge</h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2">Side</th>
              <th className="py-2">Score</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td>Left</td>
              <td><ScoreSelect value={form.lungeL} onChange={(v: any) => update("lungeL", v)} /></td>
            </tr>
            <tr>
              <td>Right</td>
              <td><ScoreSelect value={form.lungeR} onChange={(v: any) => update("lungeR", v)} /></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===================== SHOULDER MOBILITY ====================== */}
      <section className="p-4 bg-white rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">4. Shoulder Mobility</h4>

        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2">Side</th>
              <th className="py-2">Score</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td>Left</td>
              <td><ScoreSelect value={form.shoulderMobL} onChange={(v: any) => update("shoulderMobL", v)} /></td>
            </tr>
            <tr>
              <td>Right</td>
              <td><ScoreSelect value={form.shoulderMobR} onChange={(v: any) => update("shoulderMobR", v)} /></td>
            </tr>
          </tbody>
        </table>

        {/* Clearing Test */}
        <div>
          <label className="text-sm font-medium text-gray-900">Clearing Test (Pain?)</label>
          <select
            value={form.clearingTestShoulder}
            onChange={(e) => update("clearingTestShoulder", e.target.value)}
            className="w-full mt-2 p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">--</option>
            <option value="Pain">Pain</option>
            <option value="Negative">Negative</option>
          </select>
        </div>
      </section>

      {/* ===================== ASLR ====================== */}
      <section className="p-4 bg-white rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">5. Active Straight Leg Raise (ASLR)</h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2">Side</th>
              <th className="py-2">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td>Left</td>
              <td><ScoreSelect value={form.aslrL} onChange={(v: any) => update("aslrL", v)} /></td>
            </tr>
            <tr>
              <td>Right</td>
              <td><ScoreSelect value={form.aslrR} onChange={(v: any) => update("aslrR", v)} /></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===================== TRUNK STABILITY ====================== */}
      <section className="p-4 bg-white rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">6. Trunk Stability Push-Up</h4>

        <ScoreSelect
          value={form.trunkStability}
          onChange={(v: any) => update("trunkStability", v)}
        />

        {/* Clearing Test */}
        <div className="mt-4">
          <label className="text-sm font-medium text-gray-900">Clearing Test (Spinal Extension Pain?)</label>
          <select
            value={form.clearingTestTrunk}
            onChange={(e) => update("clearingTestTrunk", e.target.value)}
            className="w-full mt-2 p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">--</option>
            <option value="Pain">Pain</option>
            <option value="Negative">Negative</option>
          </select>
        </div>
      </section>

      {/* ===================== ROTARY STABILITY ====================== */}
      <section className="p-4 bg-white rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">7. Rotary Stability</h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2">Side</th>
              <th className="py-2">Score</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td>Left</td>
              <td><ScoreSelect value={form.rotaryL} onChange={(v: any) => update("rotaryL", v)} /></td>
            </tr>
            <tr>
              <td>Right</td>
              <td><ScoreSelect value={form.rotaryR} onChange={(v: any) => update("rotaryR", v)} /></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===================== TOTAL SCORE ====================== */}
      <section className="p-4 bg-white rounded-xl border border-gray-200 shadow-md">
        <div className="text-lg font-semibold text-gray-800">
          Total FMS Score:
          <span className="text-green-700 ml-2">{totalScore}</span>
        </div>
      </section>
    </div>
  );
}
