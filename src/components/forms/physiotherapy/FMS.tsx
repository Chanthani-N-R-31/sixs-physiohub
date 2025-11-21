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

  // Base ScoreSelect component with customizable options
  const ScoreSelect = ({ value, onChange, options }: any) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
    >
      <option value="">--</option>
      {options.map((opt: { value: string; label: string }) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );

  // Deep Squat Score Options
  const DeepSquatScore = ({ value, onChange }: any) => (
    <ScoreSelect
      value={value}
      onChange={onChange}
      options={[
        { value: "3", label: "3 - Performs correctly (* Torso parallel to tibia, * Femur below horizontal, * Knees aligned, * Dowel aligned)" },
        { value: "2", label: "2 - With compensation (* Torso parallel to tibia)" },
        { value: "1", label: "1 - Unable/poor (* Lumbor flexion is noted)" },
        { value: "0", label: "0 - Pain" },
      ]}
    />
  );

  // Hurdle Step Score Options
  const HurdleStepScore = ({ value, onChange }: any) => (
    <ScoreSelect
      value={value}
      onChange={onChange}
      options={[
        { value: "3", label: "3 - Performs correctly (* Hip, knee and ankle aligned, * No movement in lumbar spine, * Dowel and hurdle remain parallel)" },
        { value: "2", label: "2 - With compensation (* Movement is noted)" },
        { value: "1", label: "1 - Unable/poor (* Contact between foot and hurdle, * Loss of balance)" },
        { value: "0", label: "0 - Pain" },
      ]}
    />
  );

  // Inline Lunge Score Options
  const InlineLungeScore = ({ value, onChange }: any) => (
    <ScoreSelect
      value={value}
      onChange={onChange}
      options={[
        { value: "3", label: "3 - Performs correctly (* Dowel contact remains L-spine extension, * No Torso movement, * Dowel and feet remain in sagittal plane, * Knee touches board behind heel of front foot)" },
        { value: "2", label: "2 - With compensation (* Movement is noted)" },
        { value: "1", label: "1 - Unable/poor (* Loss of balance)" },
        { value: "0", label: "0 - Pain" },
      ]}
    />
  );

  // Shoulder Mobility Score Options
  const ShoulderMobilityScore = ({ value, onChange }: any) => (
    <ScoreSelect
      value={value}
      onChange={onChange}
      options={[
        { value: "3", label: "3 - Performs correctly (* Fists are within one hand length)" },
        { value: "2", label: "2 - With compensation (* Fists are within one and a half hand length)" },
        { value: "1", label: "1 - Unable/poor (* Fists are not within one and half hand length)" },
        { value: "0", label: "0 - Pain" },
      ]}
    />
  );

  // ASLR Score Options
  const ASLRScore = ({ value, onChange }: any) => (
    <ScoreSelect
      value={value}
      onChange={onChange}
      options={[
        { value: "3", label: "3 - Performs correctly (* Ankle/Dowel resided between mid thigh and ASIS)" },
        { value: "2", label: "2 - With compensation (*Ankle/Dowel resided between mid thigh and mid patella/joint line)" },
        { value: "1", label: "1 - Unable/poor (* Ankle/Dowel resided below mid patella/joint line)" },
        { value: "0", label: "0 - Pain" },
      ]}
    />
  );

  // Trunk Stability Score Options
  const TrunkStabilityScore = ({ value, onChange }: any) => (
    <ScoreSelect
      value={value}
      onChange={onChange}
      options={[
        { value: "3", label: "3 - Performs correctly (* Males perform 1 rep with thumbs aligned with top of forehead, * Females perform 1 rep with thumbs aligned with chin)" },
        { value: "2", label: "2 - With compensation (* Males perform 1 rep with thumbs aligned with chin, * Females perform 1 rep with thumbs aligned with clavicle)" },
        { value: "1", label: "1 - Unable/poor (* Males unable to perform 1 rep with thumbs aligned with chin, * Females unable to perform 1 rep with thumbs aligned with clavicle)" },
        { value: "0", label: "0 - Pain" },
      ]}
    />
  );

  // Rotary Stability Score Options
  const RotaryStabilityScore = ({ value, onChange }: any) => (
    <ScoreSelect
      value={value}
      onChange={onChange}
      options={[
        { value: "3", label: "3 - Performs correctly (* Perform 1 correct unilateral rep, * Knee and elbow touch in-line over the board)" },
        { value: "2", label: "2 - With compensation (* Perform 1 correct diagnol rep, * Knee and elbow touch in-line over the board)" },
        { value: "1", label: "1 - Unable/poor (* Inability to perform diagnol repititions)" },
        { value: "0", label: "0 - Pain" },
      ]}
    />
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

        <DeepSquatScore
          value={form.deepSquat}
          onChange={(v: any) => update("deepSquat", v)}
        />
      </section>

      {/* ===================== HURDLE STEP ====================== */}
      <section className="p-4 bg-white rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">2. Hurdle Step</h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 font-medium">
              <th className="py-2">Side</th>
              <th className="py-2">Score</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-gray-900">Left</td>
              <td><HurdleStepScore value={form.hurdleL} onChange={(v: any) => update("hurdleL", v)} /></td>
            </tr>
            <tr>
              <td className="py-2 text-gray-900">Right</td>
              <td><HurdleStepScore value={form.hurdleR} onChange={(v: any) => update("hurdleR", v)} /></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===================== INLINE LUNGE ====================== */}
      <section className="p-4 bg-white rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">3. Inline Lunge</h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 font-medium">
              <th className="py-2">Side</th>
              <th className="py-2">Score</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-gray-900">Left</td>
              <td><InlineLungeScore value={form.lungeL} onChange={(v: any) => update("lungeL", v)} /></td>
            </tr>
            <tr>
              <td className="py-2 text-gray-900">Right</td>
              <td><InlineLungeScore value={form.lungeR} onChange={(v: any) => update("lungeR", v)} /></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===================== SHOULDER MOBILITY ====================== */}
      <section className="p-4 bg-white rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">4. Shoulder Mobility</h4>

        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="text-left text-gray-700 font-medium">
              <th className="py-2">Side</th>
              <th className="py-2">Score</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-gray-900">Left</td>
              <td><ShoulderMobilityScore value={form.shoulderMobL} onChange={(v: any) => update("shoulderMobL", v)} /></td>
            </tr>
            <tr>
              <td className="py-2 text-gray-900">Right</td>
              <td><ShoulderMobilityScore value={form.shoulderMobR} onChange={(v: any) => update("shoulderMobR", v)} /></td>
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
            <tr className="text-left text-gray-700 font-medium">
              <th className="py-2">Side</th>
              <th className="py-2">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-gray-900">Left</td>
              <td><ASLRScore value={form.aslrL} onChange={(v: any) => update("aslrL", v)} /></td>
            </tr>
            <tr>
              <td className="py-2 text-gray-900">Right</td>
              <td><ASLRScore value={form.aslrR} onChange={(v: any) => update("aslrR", v)} /></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===================== TRUNK STABILITY ====================== */}
      <section className="p-4 bg-white rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">6. Trunk Stability Push-Up</h4>

        <TrunkStabilityScore
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
            <tr className="text-left text-gray-700 font-medium">
              <th className="py-2">Side</th>
              <th className="py-2">Score</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-gray-900">Left</td>
              <td><RotaryStabilityScore value={form.rotaryL} onChange={(v: any) => update("rotaryL", v)} /></td>
            </tr>
            <tr>
              <td className="py-2 text-gray-900">Right</td>
              <td><RotaryStabilityScore value={form.rotaryR} onChange={(v: any) => update("rotaryR", v)} /></td>
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
