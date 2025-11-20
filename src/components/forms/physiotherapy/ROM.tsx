// src/components/forms/physiotherapy/ROM.tsx
"use client";

import { useState } from "react";

export default function ROM() {
  const [rom, setRom] = useState({
    // Cervical
    cervFlex: "",
    cervExt: "",
    cervLatFlexL: "",
    cervLatFlexR: "",
    cervRotL: "",
    cervRotR: "",

    // Thoracic / Lumbar
    thorFlex: "",
    thorExt: "",
    thorLatFlexL: "",
    thorLatFlexR: "",
    thorRotL: "",
    thorRotR: "",

    // Shoulder
    shFlexL: "",
    shFlexR: "",
    shAbdL: "",
    shAbdR: "",
    shERL: "",
    shERR: "",
    shIRL: "",
    shIRR: "",

    // Hip ROM
    hipFlexL: "",
    hipFlexR: "",
    hipAbdL: "",
    hipAbdR: "",
    hipERL: "",
    hipERR: "",
    hipIRL: "",
    hipIRR: "",

    // Knee
    kneeFlexL: "",
    kneeFlexR: "",
    kneeExtL: "",
    kneeExtR: "",

    // Ankle
    ankleDFL: "",
    ankleDFR: "",
    anklePFL: "",
    anklePFR: "",

    notes: "",
  });

  const u = (key: string, val: string) => {
    setRom((prev) => ({ ...prev, [key]: val }));
  };

  // Reusable cell renderer
  const InputCell = ({ value, onChange }: any) => (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500"
      placeholder="°"
    />
  );

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900">Range of Motion (ROM)</h3>

      {/* ===================== CERVICAL ROM ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Cervical Spine</h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 font-medium">
              <th className="py-2">Movement</th>
              <th className="py-2">Left</th>
              <th className="py-2">Right</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-gray-900">Side Flexion</td>
              <td><InputCell value={rom.cervLatFlexL} onChange={(v: any) => u("cervLatFlexL", v)} /></td>
              <td><InputCell value={rom.cervLatFlexR} onChange={(v: any) => u("cervLatFlexR", v)} /></td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Rotation</td>
              <td><InputCell value={rom.cervRotL} onChange={(v: any) => u("cervRotL", v)} /></td>
              <td><InputCell value={rom.cervRotR} onChange={(v: any) => u("cervRotR", v)} /></td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Flexion</td>
              <td colSpan={2}><InputCell value={rom.cervFlex} onChange={(v: any) => u("cervFlex", v)} /></td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Extension</td>
              <td colSpan={2}><InputCell value={rom.cervExt} onChange={(v: any) => u("cervExt", v)} /></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===================== THORACIC/LUMBAR ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Thoracic / Lumbar Spine</h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 font-medium">
              <th className="py-2">Movement</th>
              <th className="py-2">Left</th>
              <th className="py-2">Right</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-gray-900">Side Flexion</td>
              <td><InputCell value={rom.thorLatFlexL} onChange={(v: any) => u("thorLatFlexL", v)} /></td>
              <td><InputCell value={rom.thorLatFlexR} onChange={(v: any) => u("thorLatFlexR", v)} /></td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Rotation</td>
              <td><InputCell value={rom.thorRotL} onChange={(v: any) => u("thorRotL", v)} /></td>
              <td><InputCell value={rom.thorRotR} onChange={(v: any) => u("thorRotR", v)} /></td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Flexion</td>
              <td colSpan={2}><InputCell value={rom.thorFlex} onChange={(v: any) => u("thorFlex", v)} /></td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Extension</td>
              <td colSpan={2}><InputCell value={rom.thorExt} onChange={(v: any) => u("thorExt", v)} /></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===================== SHOULDER ROM ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Shoulder</h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 font-medium">
              <th className="py-2">Movement</th>
              <th className="py-2">Left</th>
              <th className="py-2">Right</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-gray-900">Flexion</td>
              <td><InputCell value={rom.shFlexL} onChange={(v: any) => u("shFlexL", v)} /></td>
              <td><InputCell value={rom.shFlexR} onChange={(v: any) => u("shFlexR", v)} /></td>
            </tr>

            <tr>
              <td>Abduction</td>
              <td><InputCell value={rom.shAbdL} onChange={(v: any) => u("shAbdL", v)} /></td>
              <td><InputCell value={rom.shAbdR} onChange={(v: any) => u("shAbdR", v)} /></td>
            </tr>

            <tr>
              <td>External Rotation</td>
              <td><InputCell value={rom.shERL} onChange={(v: any) => u("shERL", v)} /></td>
              <td><InputCell value={rom.shERR} onChange={(v: any) => u("shERR", v)} /></td>
            </tr>

            <tr>
              <td>Internal Rotation</td>
              <td><InputCell value={rom.shIRL} onChange={(v: any) => u("shIRL", v)} /></td>
              <td><InputCell value={rom.shIRR} onChange={(v: any) => u("shIRR", v)} /></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===================== HIP ROM ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Hip</h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 font-medium">
              <th>Movement</th>
              <th>Left</th>
              <th>Right</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-gray-900">Flexion</td>
              <td><InputCell value={rom.hipFlexL} onChange={(v: any) => u("hipFlexL", v)} /></td>
              <td><InputCell value={rom.hipFlexR} onChange={(v: any) => u("hipFlexR", v)} /></td>
            </tr>

            <tr>
              <td>Abduction</td>
              <td><InputCell value={rom.hipAbdL} onChange={(v: any) => u("hipAbdL", v)} /></td>
              <td><InputCell value={rom.hipAbdR} onChange={(v: any) => u("hipAbdR", v)} /></td>
            </tr>

            <tr>
              <td>External Rotation</td>
              <td><InputCell value={rom.hipERL} onChange={(v: any) => u("hipERL", v)} /></td>
              <td><InputCell value={rom.hipERR} onChange={(v: any) => u("hipERR", v)} /></td>
            </tr>

            <tr>
              <td>Internal Rotation</td>
              <td><InputCell value={rom.hipIRL} onChange={(v: any) => u("hipIRL", v)} /></td>
              <td><InputCell value={rom.hipIRR} onChange={(v: any) => u("hipIRR", v)} /></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===================== KNEE ROM ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Knee</h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 font-medium">
              <th>Movement</th>
              <th>Left</th>
              <th>Right</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-gray-900">Flexion</td>
              <td><InputCell value={rom.kneeFlexL} onChange={(v: any) => u("kneeFlexL", v)} /></td>
              <td><InputCell value={rom.kneeFlexR} onChange={(v: any) => u("kneeFlexR", v)} /></td>
            </tr>

            <tr>
              <td>Extension</td>
              <td><InputCell value={rom.kneeExtL} onChange={(v: any) => u("kneeExtL", v)} /></td>
              <td><InputCell value={rom.kneeExtR} onChange={(v: any) => u("kneeExtR", v)} /></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===================== ANKLE ROM ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Ankle</h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 font-medium">
              <th>Movement</th>
              <th>Left</th>
              <th>Right</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-gray-900">Dorsiflexion</td>
              <td><InputCell value={rom.ankleDFL} onChange={(v: any) => u("ankleDFL", v)} /></td>
              <td><InputCell value={rom.ankleDFR} onChange={(v: any) => u("ankleDFR", v)} /></td>
            </tr>

            <tr>
              <td>Plantarflexion</td>
              <td><InputCell value={rom.anklePFL} onChange={(v: any) => u("anklePFL", v)} /></td>
              <td><InputCell value={rom.anklePFR} onChange={(v: any) => u("anklePFR", v)} /></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* NOTES */}
      <div>
        <label className="text-sm font-medium text-gray-900">Additional Notes</label>
        <textarea
          value={rom.notes}
          onChange={(e) => u("notes", e.target.value)}
          className="w-full p-3 mt-1 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500"
          rows={3}
          placeholder="Observations, restrictions, compensations..."
        />
      </div>
    </div>
  );
}
