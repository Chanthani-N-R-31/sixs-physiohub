// src/components/forms/physiotherapy/FMS.tsx
"use client";

import { useState, useMemo, useCallback, useEffect, memo } from "react";

// --- 1. DEFINE HELPER COMPONENTS OUTSIDE ---

// Base ScoreSelect Component
const ScoreSelect = memo(({ value, onChange, options }: any) => {
  return (
    <select
      value={value || ""}
      onChange={(e) => {
        const newValue = e.target.value;
        if (onChange) {
          onChange(newValue);
        }
      }}
      className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
    >
      <option value="">--</option>
      {options.map((opt: { value: string; label: string }) => (
        <option key={opt.value} value={String(opt.value)}>
          {opt.label}
        </option>
      ))}
    </select>
  );
});

ScoreSelect.displayName = "ScoreSelect";

// Specific Score Components (Moved Outside)
const DeepSquatScore = memo(({ value, onChange }: any) => (
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
));
DeepSquatScore.displayName = "DeepSquatScore";

const HurdleStepScore = memo(({ value, onChange }: any) => (
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
));
HurdleStepScore.displayName = "HurdleStepScore";

const InlineLungeScore = memo(({ value, onChange }: any) => (
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
));
InlineLungeScore.displayName = "InlineLungeScore";

const ShoulderMobilityScore = memo(({ value, onChange }: any) => (
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
));
ShoulderMobilityScore.displayName = "ShoulderMobilityScore";

const ASLRScore = memo(({ value, onChange }: any) => (
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
));
ASLRScore.displayName = "ASLRScore";

const TrunkStabilityScore = memo(({ value, onChange }: any) => (
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
));
TrunkStabilityScore.displayName = "TrunkStabilityScore";

const RotaryStabilityScore = memo(({ value, onChange }: any) => (
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
));
RotaryStabilityScore.displayName = "RotaryStabilityScore";


// --- 2. MAIN COMPONENT ---

interface FMSProps {
  initialData?: any;
  onSave?: (data: any) => void;
}

export default function FMS({ initialData, onSave }: FMSProps) {
  const [form, setForm] = useState({
    deepSquat: "",
    hurdleL: "",
    hurdleR: "",
    lungeL: "",
    lungeR: "",
    shoulderMobL: "",
    shoulderMobR: "",
    clearingTestShoulder: "",
    aslrL: "",
    aslrR: "",
    trunkStability: "",
    clearingTestTrunk: "",
    rotaryL: "",
    rotaryR: "",
    assessmentFindings: "",
  });

  const [isSaved, setIsSaved] = useState(false);

  const update = useCallback((key: string, value: string) => {
    setForm((prev) => {
      if (prev[key as keyof typeof prev] === value) {
        return prev;
      }
      return { ...prev, [key]: value };
    });
  }, []);

  // Helper function to remove numbers from text-only fields
  const filterTextOnly = (value: string): string => {
    return value.replace(/[0-9]/g, '');
  };

  useEffect(() => {
    if (initialData) {
      setForm((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);


  const totalScore = useMemo(() => {
    const numericValues = Object.values(form)
      .filter((v) => v !== "" && !isNaN(Number(v))) // Added isNaN check
      .map((v) => Number(v));

    return numericValues.reduce((sum, n) => sum + n, 0);
  }, [form]);

  return (
    <div className="space-y-10">
      <h3 className="text-xl font-bold text-white">Functional Movement Screening (FMS)</h3>

      {/* ===================== DEEP SQUAT ====================== */}
      <section className="p-4 bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
        <h4 className="text-lg font-semibold text-white mb-3">1. Deep Squat</h4>
        <DeepSquatScore
          value={form.deepSquat}
          onChange={(v: any) => update("deepSquat", v)}
        />
      </section>

      {/* ===================== HURDLE STEP ====================== */}
      <section className="p-4 bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
        <h4 className="text-lg font-semibold text-white mb-3">2. Hurdle Step</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/70 font-bold border-b border-gray-700">
              <th className="py-2">Side</th>
              <th className="py-2">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-white">Left</td>
              <td><HurdleStepScore value={form.hurdleL} onChange={(v: any) => update("hurdleL", v)} /></td>
            </tr>
            <tr>
              <td className="py-2 text-white">Right</td>
              <td><HurdleStepScore value={form.hurdleR} onChange={(v: any) => update("hurdleR", v)} /></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===================== INLINE LUNGE ====================== */}
      <section className="p-4 bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
        <h4 className="text-lg font-semibold text-white mb-3">3. Inline Lunge</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/70 font-bold border-b border-gray-700">
              <th className="py-2">Side</th>
              <th className="py-2">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-white">Left</td>
              <td><InlineLungeScore value={form.lungeL} onChange={(v: any) => update("lungeL", v)} /></td>
            </tr>
            <tr>
              <td className="py-2 text-white">Right</td>
              <td><InlineLungeScore value={form.lungeR} onChange={(v: any) => update("lungeR", v)} /></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===================== SHOULDER MOBILITY ====================== */}
      <section className="p-4 bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
        <h4 className="text-lg font-semibold text-white mb-3">4. Shoulder Mobility</h4>
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="text-left text-white/70 font-bold border-b border-gray-700">
              <th className="py-2">Side</th>
              <th className="py-2">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-white">Left</td>
              <td><ShoulderMobilityScore value={form.shoulderMobL} onChange={(v: any) => update("shoulderMobL", v)} /></td>
            </tr>
            <tr>
              <td className="py-2 text-white">Right</td>
              <td><ShoulderMobilityScore value={form.shoulderMobR} onChange={(v: any) => update("shoulderMobR", v)} /></td>
            </tr>
          </tbody>
        </table>

        <div>
          <label className="text-sm font-medium text-white">Clearing Test (Pain?)</label>
          <select
            value={form.clearingTestShoulder}
            onChange={(e) => update("clearingTestShoulder", e.target.value)}
            className="w-full mt-2 p-2 border border-gray-600 rounded-md text-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">--</option>
            <option value="Pain">Pain</option>
            <option value="Negative">Negative</option>
          </select>
        </div>
      </section>

      {/* ===================== ASLR ====================== */}
      <section className="p-4 bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
        <h4 className="text-lg font-semibold text-white mb-3">5. Active Straight Leg Raise (ASLR)</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/70 font-bold border-b border-gray-700">
              <th className="py-2">Side</th>
              <th className="py-2">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-white">Left</td>
              <td><ASLRScore value={form.aslrL} onChange={(v: any) => update("aslrL", v)} /></td>
            </tr>
            <tr>
              <td className="py-2 text-white">Right</td>
              <td><ASLRScore value={form.aslrR} onChange={(v: any) => update("aslrR", v)} /></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===================== TRUNK STABILITY ====================== */}
      <section className="p-4 bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
        <h4 className="text-lg font-semibold text-white mb-3">6. Trunk Stability Push-Up</h4>
        <TrunkStabilityScore
          value={form.trunkStability}
          onChange={(v: any) => update("trunkStability", v)}
        />

        <div className="mt-4">
          <label className="text-sm font-medium text-white">Clearing Test (Spinal Extension Pain?)</label>
          <select
            value={form.clearingTestTrunk}
            onChange={(e) => update("clearingTestTrunk", e.target.value)}
            className="w-full mt-2 p-2 border border-gray-600 rounded-md text-sm bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">--</option>
            <option value="Pain">Pain</option>
            <option value="Negative">Negative</option>
          </select>
        </div>
      </section>

      {/* ===================== ROTARY STABILITY ====================== */}
      <section className="p-4 bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
        <h4 className="text-lg font-semibold text-white mb-3">7. Rotary Stability</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/70 font-bold border-b border-gray-700">
              <th className="py-2">Side</th>
              <th className="py-2">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-white">Left</td>
              <td><RotaryStabilityScore value={form.rotaryL} onChange={(v: any) => update("rotaryL", v)} /></td>
            </tr>
            <tr>
              <td className="py-2 text-white">Right</td>
              <td><RotaryStabilityScore value={form.rotaryR} onChange={(v: any) => update("rotaryR", v)} /></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===================== TOTAL SCORE ====================== */}
      <section className="p-4 bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
        <div className="text-lg font-semibold text-white">
          Total FMS Score:
          <span className="text-blue-400 ml-2">{totalScore}</span>
        </div>
      </section>

      {/* ===================== ASSESSMENT FINDINGS ====================== */}
      <section className="p-4 bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
        <h4 className="text-lg font-semibold text-white mb-3">Assessment Findings</h4>
        <textarea
          value={form.assessmentFindings}
          onChange={(e) => {
            const newValue = filterTextOnly(e.target.value);
            update("assessmentFindings", newValue);
          }}
          className="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
          rows={4}
          placeholder="Enter assessment findings (text only, no numbers)"
        />
      </section>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        {isSaved && (
          <span className="text-green-300 text-sm flex items-center font-bold">
            ✓ Saved successfully
          </span>
        )}
        <button
          onClick={() => {
            if (onSave) {
              onSave(form);
              setIsSaved(true);
              setTimeout(() => setIsSaved(false), 3000);
            }
          }}
          className="px-6 py-2 bg-blue-900 text-white rounded-lg shadow-lg hover:bg-blue-800 font-bold border border-blue-800"
        >
          Save Section
        </button>
      </div>
    </div>
  );
}