// src/components/forms/physiotherapy/Demographics.tsx
"use client";

import { useState, useCallback, useRef } from "react";

interface DemographicsProps {
  initialData?: {
    patientName?: string;
    dob?: string;
    gender?: string;
    rank?: string;
    dateOfAssessment?: string;
  };
  onSave?: (data: {
    patientName: string;
    dob: string;
    gender: string;
    rank: string;
    dateOfAssessment: string;
  }) => void;
}

export default function Demographics({ initialData, onSave }: DemographicsProps) {
  const [form, setForm] = useState({
    patientName: initialData?.patientName || "",
    dob: initialData?.dob || "",
    gender: initialData?.gender || "",
    rank: initialData?.rank || "",
    dateOfAssessment: initialData?.dateOfAssessment || "",
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);

  // Stable update function to prevent re-renders and cursor jumps
  const update = useCallback((key: string, value: string) => {
    setForm((prev) => {
      // Only update if value actually changed to prevent unnecessary re-renders
      if (prev[key as keyof typeof prev] === value) {
        return prev;
      }
      return { ...prev, [key]: value };
    });
    setIsSaved(false);

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

  // Validation function
  const validate = useCallback((key: string, value: string): string | null => {
    switch (key) {
      case "patientName":
        if (!value.trim()) {
          return "Patient name is required";
        }
        if (value.trim().length < 2) {
          return "Patient name must be at least 2 characters";
        }
        break;
      case "dob":
        if (!value) {
          return "Date of birth is required";
        }
        const dobDate = new Date(value);
        const today = new Date();
        if (dobDate > today) {
          return "Date of birth cannot be in the future";
        }
        break;
      case "gender":
        if (!value) {
          return "Gender is required";
        }
        break;
      case "rank":
        // Optional field, no validation needed
        break;
      case "dateOfAssessment":
        if (!value) {
          return "Date of assessment is required";
        }
        const assessmentDate = new Date(value);
        const todayDate = new Date();
        if (assessmentDate > todayDate) {
          return "Date of assessment cannot be in the future";
        }
        break;
    }
    return null;
  }, []);

  // Handle blur for validation
  const handleBlur = useCallback((key: string, value: string) => {
    const error = validate(key, value);
    if (error) {
      setValidationErrors((prev) => ({ ...prev, [key]: error }));
    } else {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  }, [validate]);

  // Handle save
  const handleSave = useCallback(() => {
    // Validate all fields
    const errors: Record<string, string> = {};
    let hasErrors = false;

    Object.keys(form).forEach((key) => {
      const error = validate(key, form[key as keyof typeof form]);
      if (error) {
        errors[key] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setValidationErrors(errors);
      return;
    }

    if (onSave) {
      onSave(form);
      setIsSaved(true);
    }
  }, [form, validate, onSave]);

  // Reusable input cell renderer - stable controlled component
  const InputCell = useCallback(
    ({
      value,
      onChange,
      onBlur,
      placeholder,
      type = "text",
      required = false,
      error,
    }: {
      value: string;
      onChange: (value: string) => void;
      onBlur?: () => void;
      placeholder?: string;
      type?: "text" | "date" | "number";
      required?: boolean;
      error?: string;
    }) => (
      <div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={`w-full p-2 border rounded-md text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          placeholder={placeholder}
          required={required}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    ),
    []
  );

  // Reusable select cell renderer - stable controlled component
  const SelectCell = useCallback(
    ({
      value,
      onChange,
      onBlur,
      options,
      error,
      required = false,
    }: {
      value: string;
      onChange: (value: string) => void;
      onBlur?: () => void;
      options: string[];
      error?: string;
      required?: boolean;
    }) => (
      <div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={`w-full p-2 border rounded-md text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          required={required}
        >
          <option value="">Select</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    ),
    []
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Demographics</h3>
        {isSaved && (
          <span className="text-green-600 text-sm flex items-center">
            ✓ Saved successfully
          </span>
        )}
      </div>

      {/* ===================== DEMOGRAPHIC DETAILS ====================== */}
      <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-md">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">
          Demographic Details
        </h4>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-700 font-medium">
              <th className="py-2 w-1/3">Parameter</th>
              <th className="py-2 w-2/3">Description</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <tr>
              <td className="py-2 text-gray-900">
                Patient Name <span className="text-red-500">*</span>
              </td>
              <td>
                <InputCell
                  value={form.patientName}
                  onChange={(v) => update("patientName", v)}
                  onBlur={() => handleBlur("patientName", form.patientName)}
                  placeholder="Enter patient name"
                  type="text"
                  required={true}
                  error={validationErrors.patientName}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">
                Date of Birth <span className="text-red-500">*</span>
              </td>
              <td>
                <InputCell
                  value={form.dob}
                  onChange={(v) => update("dob", v)}
                  onBlur={() => handleBlur("dob", form.dob)}
                  placeholder="Select date of birth"
                  type="date"
                  required={true}
                  error={validationErrors.dob}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">
                Gender <span className="text-red-500">*</span>
              </td>
              <td>
                <SelectCell
                  value={form.gender}
                  onChange={(v) => update("gender", v)}
                  onBlur={() => handleBlur("gender", form.gender)}
                  options={["Male", "Female", "Other"]}
                  required={true}
                  error={validationErrors.gender}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">Rank</td>
              <td>
                <InputCell
                  value={form.rank}
                  onChange={(v) => update("rank", v)}
                  onBlur={() => handleBlur("rank", form.rank)}
                  placeholder="Enter army rank"
                  type="text"
                  required={false}
                  error={validationErrors.rank}
                />
              </td>
            </tr>

            <tr>
              <td className="py-2 text-gray-900">
                Date of Assessment <span className="text-red-500">*</span>
              </td>
              <td>
                <InputCell
                  value={form.dateOfAssessment}
                  onChange={(v) => update("dateOfAssessment", v)}
                  onBlur={() => handleBlur("dateOfAssessment", form.dateOfAssessment)}
                  placeholder="Select date of assessment"
                  type="date"
                  required={true}
                  error={validationErrors.dateOfAssessment}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 font-medium transition-colors"
        >
          Save Demographics
        </button>
      </div>
    </div>
  );
}

