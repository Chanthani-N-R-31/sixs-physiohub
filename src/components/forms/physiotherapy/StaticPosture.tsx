// src/components/forms/physiotherapy/StaticPosture.tsx
"use client";

import { useState } from "react";

export default function StaticPosture() {
  const [form, setForm] = useState({
    // Anterior View
    headTilt: "",
    shoulderAlignment: "",
    trunkAlignment: "",
    pelvicAlignment: "",
    kneeAlignmentAnterior: "",

    // Lateral View
    headAlignmentLat: "",
    shoulderAlignmentLat: "",
    spinalCurves: "",
    pelvicTilt: "",
    kneeAlignmentLat: "",

    // Assessment Findings
    observations: "",
  });

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Reusable select cell renderer
  const SelectCell = ({ value, onChange, options }: any) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
    >
      <option value="">Select</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900">
        Static Posture Assessment
      </h3>

      {/* ===================== ANTERIOR VIEW ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Anterior View</h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 font-medium">
              <th className="py-2">Parameter</th>
              <th className="py-2">Observation</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-gray-900">Head Tilt</td>
              <td>
                <SelectCell
                  value={form.headTilt}
                  onChange={(v: string) => update("headTilt", v)}
                  options={["Neutral", "Left", "Right"]}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Shoulder Alignment</td>
              <td>
                <SelectCell
                  value={form.shoulderAlignment}
                  onChange={(v: string) => update("shoulderAlignment", v)}
                  options={[
                    "Symmetrical",
                    "Elevated (L)",
                    "Elevated (R)",
                    "Depressed (L)",
                    "Depressed (R)",
                  ]}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Trunk Alignment</td>
              <td>
                <SelectCell
                  value={form.trunkAlignment}
                  onChange={(v: string) => update("trunkAlignment", v)}
                  options={[
                    "Midline",
                    "Lateral tilt – Left",
                    "Lateral tilt – Right",
                  ]}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Pelvic Alignment</td>
              <td>
                <SelectCell
                  value={form.pelvicAlignment}
                  onChange={(v: string) => update("pelvicAlignment", v)}
                  options={["Level", "Tilted (L)", "Tilted (R)"]}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Knee Alignment</td>
              <td>
                <SelectCell
                  value={form.kneeAlignmentAnterior}
                  onChange={(v: string) => update("kneeAlignmentAnterior", v)}
                  options={["Normal", "Valgus", "Varus"]}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===================== LATERAL VIEW ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Lateral View</h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 font-medium">
              <th className="py-2">Parameter</th>
              <th className="py-2">Observation</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-gray-900">Head Alignment</td>
              <td>
                <SelectCell
                  value={form.headAlignmentLat}
                  onChange={(v: string) => update("headAlignmentLat", v)}
                  options={["Neutral", "Forward", "Retracted"]}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Shoulder Alignment</td>
              <td>
                <SelectCell
                  value={form.shoulderAlignmentLat}
                  onChange={(v: string) => update("shoulderAlignmentLat", v)}
                  options={["Aligned", "Rounded", "Protracted"]}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Spinal Curves</td>
              <td>
                <SelectCell
                  value={form.spinalCurves}
                  onChange={(v: string) => update("spinalCurves", v)}
                  options={["Normal", "Increased", "Decreased"]}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Pelvic Tilt</td>
              <td>
                <SelectCell
                  value={form.pelvicTilt}
                  onChange={(v: string) => update("pelvicTilt", v)}
                  options={["Neutral", "Anterior", "Posterior"]}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Knee Alignment</td>
              <td>
                <SelectCell
                  value={form.kneeAlignmentLat}
                  onChange={(v: string) => update("kneeAlignmentLat", v)}
                  options={["Neutral", "Hyperextension", "Flexed"]}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
