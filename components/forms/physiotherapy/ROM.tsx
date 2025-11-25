// src/components/forms/physiotherapy/ROM.tsx
"use client";

import { useState, useCallback, useEffect } from "react";

interface ROMProps {
  initialData?: any;
  onSave?: (data: any) => void;
}

export default function ROM({ initialData, onSave }: ROMProps) {
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

    // Flexibility
    sitAndReach: "",
    poplitealAngle: "",
    thomasTest: "",

    notes: "",
    assessmentFindings: "",
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);

  // Load initial data if provided
  useEffect(() => {
    if (initialData) {
      setRom((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);


  // Helper function to remove numbers from text-only fields
  const filterTextOnly = (value: string): string => {
    return value.replace(/[0-9]/g, '');
  };

  // Stable update function to prevent re-renders and cursor jumps
  const u = useCallback((key: string, val: string, isTextOnly: boolean = false) => {
    let processedValue = val;
    
    // Filter numbers from text-only fields
    if (isTextOnly && typeof val === 'string') {
      processedValue = filterTextOnly(val);
    }
    
    setRom((prev) => {
      // Only update if value actually changed to prevent unnecessary re-renders
      if (prev[key as keyof typeof prev] === processedValue) {
        return prev;
      }
      return { ...prev, [key]: processedValue };
    });

    // Clear validation error when user starts typing
    setValidationErrors((prev) => {
      if (prev[key]) {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Reusable cell renderer - stable controlled component for numeric inputs
  const InputCell = useCallback(({ value, onChange, placeholder = "°", error }: any) => (
    <div>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => {
          const val = e.target.value;
          // Only allow numbers, no letters
          if (val === "" || /^-?\d*\.?\d*$/.test(val)) {
            onChange(val);
          }
        }}
        className={`w-full p-2 border rounded-md text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        placeholder={placeholder}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  ), []);

  // Reusable textarea cell renderer - stable controlled component
  const TextareaCell = useCallback(({ value, onChange, placeholder, rows = 3, error, isTextOnly = false }: any) => (
    <div>
      <textarea
        value={value || ""}
        onChange={(e) => {
          const newValue = isTextOnly ? filterTextOnly(e.target.value) : e.target.value;
          onChange(newValue);
        }}
        className={`w-full p-2 border rounded-md text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        placeholder={placeholder}
        rows={rows}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  ), []);

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold text-gray-900">Range of Motion(ROM) and Flexibility assessments</h3>

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
              <td className="py-2 text-gray-900">Apley's Test (cm)</td>
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
              <td className="py-2 text-gray-900">Extension</td>
              <td><InputCell value={rom.hipAbdL} onChange={(v: any) => u("hipAbdL", v)} /></td>
              <td><InputCell value={rom.hipAbdR} onChange={(v: any) => u("hipAbdR", v)} /></td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">External Rotation</td>
              <td><InputCell value={rom.hipERL} onChange={(v: any) => u("hipERL", v)} /></td>
              <td><InputCell value={rom.hipERR} onChange={(v: any) => u("hipERR", v)} /></td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Internal Rotation</td>
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
              <td className="py-2 text-gray-900">Extension</td>
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
              <td className="py-2 text-gray-900">Dorsiflexion (Knee to Wall test)</td>
              <td><InputCell value={rom.ankleDFL} onChange={(v: any) => u("ankleDFL", v)} /></td>
              <td><InputCell value={rom.ankleDFR} onChange={(v: any) => u("ankleDFR", v)} /></td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Plantarflexion</td>
              <td><InputCell value={rom.anklePFL} onChange={(v: any) => u("anklePFL", v)} /></td>
              <td><InputCell value={rom.anklePFR} onChange={(v: any) => u("anklePFR", v)} /></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ===================== FLEXIBILITY ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Flexibility</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-900 mb-1 block">Sit & Reach (cm)</label>
            <InputCell
              value={rom.sitAndReach}
              onChange={(v: string) => u("sitAndReach", v)}
              placeholder="cm"
              error={validationErrors.sitAndReach}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-900 mb-1 block">Popliteal Angle (deg)</label>
            <InputCell
              value={rom.poplitealAngle}
              onChange={(v: string) => u("poplitealAngle", v)}
              placeholder="°"
              error={validationErrors.poplitealAngle}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-900 mb-1 block">Thomas Test (deg)</label>
            <InputCell
              value={rom.thomasTest}
              onChange={(v: string) => u("thomasTest", v)}
              placeholder="°"
              error={validationErrors.thomasTest}
            />
          </div>
        </div>
      </section>

      {/* ===================== ASSESSMENT FINDINGS ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Assessment Findings</h4>
        <TextareaCell
          value={rom.assessmentFindings}
          onChange={(v: string) => u("assessmentFindings", v, true)}
          placeholder="Enter assessment findings (text only, no numbers)"
          rows={4}
          isTextOnly={true}
          error={validationErrors.assessmentFindings}
        />
      </section>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        {isSaved && (
          <span className="text-green-600 text-sm flex items-center">
            ✓ Saved successfully
          </span>
        )}
        <button
          onClick={() => {
            if (onSave) {
              onSave(rom);
              setIsSaved(true);
              setTimeout(() => setIsSaved(false), 3000);
            }
          }}
          className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 font-medium"
        >
          Save Section
        </button>
      </div>
    </div>
  );
}
