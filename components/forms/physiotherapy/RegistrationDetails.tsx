"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface RegistrationDetailsProps {
  initialData?: any;
  onSave?: (data: any) => void;
}

export default function RegistrationDetails({
  initialData,
  onSave,
}: RegistrationDetailsProps) {
  const [form, setForm] = useState({
    // Section 1 - Personal Identification
    firstName: initialData?.firstName || "",
    initials: initialData?.initials || "",
    lastName: initialData?.lastName || "",
    fullName: initialData?.fullName || "",
    photograph: null as File | null,
    photographPreview: "",
    serviceBranch: initialData?.serviceBranch || "",
    serviceNumber: initialData?.serviceNumber || "",
    rank: initialData?.rank || "",
    currentAppointment: initialData?.currentAppointment || "",
    enlistmentDate: initialData?.enlistmentDate || "",
    yearsInService: initialData?.yearsInService || "",
    yearsInSpecialForces: initialData?.yearsInSpecialForces || "",
    dob: initialData?.dob || "",
    age: initialData?.age || "",
    gender: initialData?.gender || "",
    bloodGroup: initialData?.bloodGroup || "",
    dominantHand: initialData?.dominantHand || "",
    dominantLeg: initialData?.dominantLeg || "",
    dominantEye: initialData?.dominantEye || "",
    serviceIdScan: null as File | null,
    serviceIdScanPreview: "",
    medicalCategoryDoc: null as File | null,
    medicalCategoryDocPreview: "",
    
    // Section 2 - Service History
    totalYearsArmedForces: initialData?.totalYearsArmedForces || "",
    totalYearsCombatRole: initialData?.totalYearsCombatRole || "",
    totalYearsSpecialForces: initialData?.totalYearsSpecialForces || "",
    sfCourses: initialData?.sfCourses || {},
    primaryRifle: initialData?.primaryRifle || "",
    secondaryWeapon: initialData?.secondaryWeapon || "",
    lmgMmg: initialData?.lmgMmg || "",
    sniperSystems: initialData?.sniperSystems || "",
    underwaterWeapons: initialData?.underwaterWeapons || "",
    cqbWeapons: initialData?.cqbWeapons || "",
    rifleScore: initialData?.rifleScore || "",
    pistolScore: initialData?.pistolScore || "",
    nightFiringScore: initialData?.nightFiringScore || "",
    movingTargetScore: initialData?.movingTargetScore || "",
    
    // Section 3 - Operational Deployment
    terrainExposure: initialData?.terrainExposure || {},
    missionExposure: initialData?.missionExposure || {},
    typicalLoad: initialData?.typicalLoad || "",
    maximumLoad: initialData?.maximumLoad || "",
    longestMissionDuration: initialData?.longestMissionDuration || "",
    maxContinuousMovement: initialData?.maxContinuousMovement || "",
    nightOpsPerMonth: initialData?.nightOpsPerMonth || "",
    nvdProficiency: initialData?.nvdProficiency || "",
    nightNavigationRating: initialData?.nightNavigationRating || "",
    
    // Section 4 - Medical, Injury & Durability
    medicalCategory: initialData?.medicalCategory || "",
    medicalDowngrades: initialData?.medicalDowngrades || "",
    injuryHistory: initialData?.injuryHistory || [],
    chronicConditions: initialData?.chronicConditions || {},
    painLocation: initialData?.painLocation || "",
    painIntensity: initialData?.painIntensity || "",
    painTriggers: initialData?.painTriggers || "",
    
    // Section 5 - Sleep, Hydration & Recovery
    avgSleepHours: initialData?.avgSleepHours || "",
    sleepQuality: initialData?.sleepQuality || "",
    sleepDisruptions: initialData?.sleepDisruptions || "",
    sleepDeprivationExposure: initialData?.sleepDeprivationExposure || "",
    waterIntake: initialData?.waterIntake || "",
    electrolyteUse: initialData?.electrolyteUse || "",
    hydrationScore: initialData?.hydrationScore || "",
    physiotherapyFrequency: initialData?.physiotherapyFrequency || "",
    manualTherapy: initialData?.manualTherapy || "",
    hotColdTherapy: initialData?.hotColdTherapy || "",
    breathingDrills: initialData?.breathingDrills || "",
    supplementUse: initialData?.supplementUse || "",
    
    // Section 6 - Training Load & Duty Load
    runningVolume: initialData?.runningVolume || "",
    swimmingVolume: initialData?.swimmingVolume || "",
    loadMarchVolume: initialData?.loadMarchVolume || "",
    strengthSessions: initialData?.strengthSessions || "",
    tacticalDrills: initialData?.tacticalDrills || "",
    shootingSessions: initialData?.shootingSessions || "",
    maritimeSkills: initialData?.maritimeSkills || "",
    airborneTasks: initialData?.airborneTasks || "",
    guardDuty: initialData?.guardDuty || "",
    fieldExerciseHours: initialData?.fieldExerciseHours || "",
    deckDuty: initialData?.deckDuty || "",
    standToHoursAltitude: initialData?.standToHoursAltitude || "",
    
    // Section 7 - Self-Assessment
    strengthAreas: initialData?.strengthAreas || "",
    weakAreas: initialData?.weakAreas || "",
    terrainReadinessHighAltitude: initialData?.terrainReadinessHighAltitude || "",
    terrainReadinessJungle: initialData?.terrainReadinessJungle || "",
    terrainReadinessDesert: initialData?.terrainReadinessDesert || "",
    terrainReadinessMaritime: initialData?.terrainReadinessMaritime || "",
    terrainReadinessUrban: initialData?.terrainReadinessUrban || "",
    missionReadinessScore: initialData?.missionReadinessScore || "",
    
    // Section 8 - Commander Assessment
    observedStrengths: initialData?.observedStrengths || "",
    observedLimitations: initialData?.observedLimitations || "",
    terrainSuitability: initialData?.terrainSuitability || "",
    deploymentReadiness: initialData?.deploymentReadiness || "",
    requalificationRequirement: initialData?.requalificationRequirement || "",
    recommendedScFocusAreas: initialData?.recommendedScFocusAreas || "",
    
    // Existing fields
    contact: initialData?.contact || "",
    email: initialData?.email || "",
    trainingDepartment: initialData?.trainingDepartment || "",
    dateOfAssessment: initialData?.dateOfAssessment || "",
  });

  const [isSaved, setIsSaved] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([1]));
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Refs to track if auto-calculated fields should update (prevents cursor jumps)
  const isUpdatingFullName = useRef(false);
  const isUpdatingAge = useRef(false);
  const isUpdatingYearsInService = useRef(false);

  // Load initial data when it changes (for editing)
  useEffect(() => {
    if (initialData) {
      setForm((prev) => {
        // Create a new form object with initialData values, preserving file fields
        const updated: any = { ...prev };
        
        // Update all fields from initialData except file fields
        Object.keys(initialData).forEach((key) => {
          // Skip file fields - they're handled separately
          if (key === 'photograph' || key === 'serviceIdScan' || key === 'medicalCategoryDoc') {
            return;
          }
          
          // Update if the value exists and is not null/undefined
          if (initialData[key] !== null && initialData[key] !== undefined) {
            // For empty strings, still update to allow clearing fields
            updated[key] = initialData[key];
          }
        });
        
        return updated;
      });
    }
  }, [initialData]);

  // Helper function to remove numbers from text-only fields
  const filterTextOnly = (value: string): string => {
    return value.replace(/[0-9]/g, '');
  };

  // Helper function to filter only integers (remove all non-digit characters)
  const filterIntegerOnly = (value: string): string => {
    return value.replace(/[^0-9]/g, '');
  };

  // Helper function to filter contact number to exactly 10 digits
  const filterContactNumber = (value: string): string => {
    // Remove all non-digit characters
    const digitsOnly = value.replace(/[^0-9]/g, '');
    // Limit to 10 digits
    return digitsOnly.slice(0, 10);
  };

  // Helper function to validate text-only fields
  const validateTextOnly = (key: string, value: string): string | null => {
    const textOnlyFields = [
      'firstName', 'initials', 'lastName', 'currentAppointment',
      'strengthAreas', 'weakAreas', 'observedStrengths', 'observedLimitations',
      'terrainSuitability', 'recommendedScFocusAreas', 'trainingDepartment',
      'painLocation', 'painTriggers', 'medicalDowngrades'
    ];
    
    if (textOnlyFields.includes(key) && /[0-9]/.test(value)) {
      return 'This field should only contain text, no numbers allowed';
    }
    return null;
  };

  // Helper function to check if a field should be integer-only
  const isIntegerOnlyField = (key: string): boolean => {
    const integerOnlyFields = [
      'totalYearsArmedForces',
      'totalYearsCombatRole',
      'totalYearsSpecialForces'
    ];
    return integerOnlyFields.includes(key);
  };

  // Helper function to calculate full name from parts
  const calculateFullName = useCallback((firstName: string, initials: string, lastName: string): string => {
    // Trim each part and filter out empty strings and whitespace-only strings
    const first = (firstName || "").trim();
    const init = (initials || "").trim();
    const last = (lastName || "").trim();
    
    // Only include non-empty parts
    const parts: string[] = [];
    if (first) parts.push(first);
    if (init) parts.push(init);
    if (last) parts.push(last);
    
    return parts.join(" ").trim();
  }, []);

  // Auto-calculate Full Name (only when name fields change, not on every render)
  useEffect(() => {
    if (isUpdatingFullName.current) {
      isUpdatingFullName.current = false;
      return;
    }
    
    const newFullName = calculateFullName(form.firstName, form.initials, form.lastName);
    
    // Always update if the calculated name is different from current
    // This ensures it updates even if initialData had wrong fullName
    if (newFullName !== form.fullName) {
      isUpdatingFullName.current = true;
      setForm((prev) => ({ ...prev, fullName: newFullName }));
    }
  }, [form.firstName, form.initials, form.lastName, calculateFullName]);

  // Auto-calculate Age from DOB (only when DOB changes)
  useEffect(() => {
    if (isUpdatingAge.current) {
      isUpdatingAge.current = false;
      return;
    }
    if (form.dob && form.dob.length === 10) { // Only calc if full date present
      const dobParts = form.dob.split("/");
      if (dobParts.length === 3) {
        try {
          const dobDate = new Date(`${dobParts[2]}-${dobParts[1]}-${dobParts[0]}`);
          const today = new Date();
          let age = today.getFullYear() - dobDate.getFullYear();
          const monthDiff = today.getMonth() - dobDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
            age--;
          }
          const newAge = age.toString();
          if (newAge !== form.age) {
            isUpdatingAge.current = true;
            setForm((prev) => ({ ...prev, age: newAge }));
          }
        } catch (e) {
          // Invalid date, don't update
        }
      }
    }
  }, [form.dob]);

  // Auto-calculate Years in Service (only when enlistment date changes)
  useEffect(() => {
    if (isUpdatingYearsInService.current) {
      isUpdatingYearsInService.current = false;
      return;
    }
    if (form.enlistmentDate && form.enlistmentDate.length === 10) {
      const enlistParts = form.enlistmentDate.split("/");
      if (enlistParts.length === 3) {
        try {
          const enlistDate = new Date(`${enlistParts[2]}-${enlistParts[1]}-${enlistParts[0]}`);
          const today = new Date();
          let years = today.getFullYear() - enlistDate.getFullYear();
          const monthDiff = today.getMonth() - enlistDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < enlistDate.getDate())) {
            years--;
          }
          const newYears = years.toString();
          if (newYears !== form.yearsInService) {
            isUpdatingYearsInService.current = true;
            setForm((prev) => ({ ...prev, yearsInService: newYears }));
          }
        } catch (e) {
          // Invalid date, don't update
        }
      }
    }
  }, [form.enlistmentDate]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      // Cleanup preview URLs
      if (form.photographPreview) {
        URL.revokeObjectURL(form.photographPreview);
      }
      if (form.serviceIdScanPreview) {
        URL.revokeObjectURL(form.serviceIdScanPreview);
      }
      if (form.medicalCategoryDocPreview) {
        URL.revokeObjectURL(form.medicalCategoryDocPreview);
      }
      // Cleanup sfCourses certificate previews
      if (form.sfCourses) {
        Object.keys(form.sfCourses).forEach((key) => {
          if (key.endsWith("_certPreview") && typeof (form.sfCourses as any)[key] === 'string') {
            URL.revokeObjectURL((form.sfCourses as any)[key]);
          }
        });
      }
    };
  }, []);

  // --- STRICT DATE FORMATTER (DD/MM/YYYY) ---
  const formatStrictDate = (value: string): string => {
    // 1. Remove non-digits (Prevents letters)
    const cleaned = value.replace(/\D/g, '');
    
    // 2. Limit to 8 chars (DDMMYYYY)
    const truncated = cleaned.slice(0, 8);
    
    // 3. Auto-Insert Slashes
    let formatted = truncated;
    if (truncated.length > 2) {
      formatted = truncated.slice(0, 2) + '/' + truncated.slice(2);
    }
    if (truncated.length > 4) {
      formatted = formatted.slice(0, 5) + '/' + formatted.slice(5);
    }
    return formatted;
  };

  // --- DATE VALIDATION (Calendar Logic) ---
  const validateDateInput = (key: string, value: string) => {
    // If empty, clear error
    if (!value) {
       setValidationErrors((prev) => {
         const newErrors = { ...prev };
         delete newErrors[key];
         return newErrors;
       });
       return;
    }

    const cleaned = value.replace(/\D/g, '');
    
    // Validate Day (1-31)
    if (cleaned.length >= 2) {
      const day = parseInt(cleaned.slice(0, 2));
      if (day > 31 || day === 0) {
        setValidationErrors((prev) => ({ ...prev, [key]: "Invalid Day (Max 31)" }));
        return;
      }
    }

    // Validate Month (1-12)
    if (cleaned.length >= 4) {
      const month = parseInt(cleaned.slice(2, 4));
      if (month > 12 || month === 0) {
        setValidationErrors((prev) => ({ ...prev, [key]: "Invalid Month (Max 12)" }));
        return;
      }
    }

    // Clear errors if valid so far
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  };

  // --- UPDATED UPDATE FUNCTION ---
  const update = useCallback((key: string, value: any, isTextOnly: boolean = false, isDate: boolean = false) => {
    let processedValue = value;
    
    // INTEGER ONLY LOGIC (must come before date and text logic)
    if (isIntegerOnlyField(key) && typeof value === 'string') {
      processedValue = filterIntegerOnly(value);
      // Clear any validation errors for integer fields
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
    // DATE LOGIC
    else if (isDate && typeof value === 'string') {
        processedValue = formatStrictDate(value);
        validateDateInput(key, processedValue);
    }
    // TEXT ONLY LOGIC
    else if (isTextOnly && typeof value === 'string') {
      processedValue = filterTextOnly(value);
      const error = validateTextOnly(key, processedValue);
      if (error) {
        setValidationErrors((prev) => ({ ...prev, [key]: error }));
      } else {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
      }
    }
    
    setForm((prev) => {
      // Only update if value actually changed to prevent unnecessary re-renders
      if (prev[key as keyof typeof prev] === processedValue) {
        return prev;
      }
      return { ...prev, [key]: processedValue };
    });
    setIsSaved(false);
  }, []);

  // Stable nested update function
  const updateNested = useCallback((key: string, subKey: string, value: any) => {
    setForm((prev) => {
      const current = prev[key as keyof typeof prev] as any;
      if (current?.[subKey] === value) {
        return prev; // No change, prevent re-render
      }
      return {
        ...prev,
        [key]: { ...current, [subKey]: value },
      };
    });
    setIsSaved(false);
  }, []);

  const toggleSection = useCallback((sectionNum: number) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionNum)) {
        newSet.delete(sectionNum);
      } else {
        newSet.add(sectionNum);
      }
      return newSet;
    });
  }, []);

  const handleFileChange = useCallback((key: string, file: File | null) => {
    setForm((prev) => {
      if (prev[key as keyof typeof prev] === file) {
        return prev; // No change, prevent re-render
      }
      
      // Revoke old preview URL if it exists
      const previewKey = `${key}Preview` as keyof typeof prev;
      if (prev[previewKey] && typeof prev[previewKey] === 'string') {
        URL.revokeObjectURL(prev[previewKey] as string);
      }
      
      // Create new preview URL if file is an image
      let previewUrl = "";
      if (file && file.type.startsWith("image/")) {
        previewUrl = URL.createObjectURL(file);
      }
      
      return { 
        ...prev, 
        [key]: file,
        [previewKey]: previewUrl
      };
    });
    setIsSaved(false);
  }, []);

  const handleRemoveFile = useCallback((key: string) => {
    setForm((prev) => {
      const previewKey = `${key}Preview` as keyof typeof prev;
      // Revoke object URL to free memory
      if (prev[previewKey] && typeof prev[previewKey] === 'string') {
        URL.revokeObjectURL(prev[previewKey] as string);
      }
      return {
        ...prev,
        [key]: null,
        [previewKey]: ""
      };
    });
    setIsSaved(false);
  }, []);

  const handleSave = () => {
    if (onSave) {
      onSave(form);
      setIsSaved(true);
    }
  };

  const renderSectionHeader = (num: number, title: string) => (
    <div
      className="flex items-center justify-between p-4 bg-gray-700 border border-gray-600 cursor-pointer hover:bg-gray-600 transition"
      onClick={() => toggleSection(num)}
    >
      <h4 className="text-lg font-bold text-white">
        {title}
      </h4>
      <span className="text-white/70">
        {expandedSections.has(num) ? "▼" : "▶"}
      </span>
    </div>
  );

  // Determine if a field should be text-only
  const isTextOnlyField = (key: string): boolean => {
    const textOnlyFields = [
      'firstName', 'initials', 'lastName', 'currentAppointment',
      'strengthAreas', 'weakAreas', 'observedStrengths', 'observedLimitations',
      'terrainSuitability', 'recommendedScFocusAreas', 'trainingDepartment',
      'painLocation', 'painTriggers', 'medicalDowngrades'
    ];
    return textOnlyFields.includes(key);
  };

  const renderField = (
    label: string,
    key: string,
    type: "text" | "select" | "number" | "textarea" | "file" | "date-masked" = "text",
    options?: string[],
    placeholder?: string,
    readOnly = false,
    required = false
  ) => {
    const fieldValue = form[key as keyof typeof form] as string;
    const error = validationErrors[key];
    const isTextOnly = isTextOnlyField(key);
    const shouldUseTextarea = type === "textarea" || (type === "text" && (key.includes("description") || key.includes("notes") || key.includes("Areas") || key.includes("Strengths") || key.includes("Limitations") || key.includes("Suitability")));

    return (
      <tr className="border-b border-gray-700">
        <td className="w-1/3 p-3 border-r border-gray-700 bg-gray-700">
          <label className="text-sm font-medium text-white">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </td>
        <td className="w-2/3 p-3">
          {type === "select" ? (
            <select
              value={fieldValue || ""}
              onChange={(e) => update(key, e.target.value, false)}
              className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={readOnly}
            >
              <option value="">-</option>
              {options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : type === "file" ? (
            <div className="space-y-2">
              {(form[`${key}Preview` as keyof typeof form] as string) ? (
                <>
                  <div className="relative inline-block">
                    <img
                      src={form[`${key}Preview` as keyof typeof form] as string}
                      alt={`${label} preview`}
                      className="max-w-full h-auto max-h-48 rounded-lg border border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(key)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 shadow-md transition-colors"
                      title="Remove image"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div>
                    <input
                      type="file"
                      id={`file-input-${key}`}
                      onChange={(e) => handleFileChange(key, e.target.files?.[0] || null)}
                      className="hidden"
                      accept="image/*,.pdf"
                    />
                    <label
                      htmlFor={`file-input-${key}`}
                      className="inline-block px-4 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-300 rounded-lg hover:bg-green-100 cursor-pointer transition"
                    >
                      Change Image
                    </label>
                  </div>
                </>
              ) : (
                <>
                  {form[key as keyof typeof form] && !(form[`${key}Preview` as keyof typeof form] as string) ? (
                    <div className="flex items-center gap-2 p-2 border border-gray-600 rounded bg-gray-700">
                      <span className="text-sm text-gray-700">
                        {(form[key as keyof typeof form] as File)?.name || "File selected"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(key)}
                        className="ml-auto text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ) : null}
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(key, e.target.files?.[0] || null)}
                    className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    accept="image/*,.pdf"
                  />
                </>
              )}
            </div>
          ) : shouldUseTextarea ? (
            <>
              <textarea
                value={fieldValue || ""}
                onChange={(e) => {
                  const newValue = isTextOnly ? filterTextOnly(e.target.value) : e.target.value;
                  update(key, newValue, isTextOnly);
                }}
                onBlur={() => {
                  if (required && !fieldValue) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      [key]: "This field is required",
                    }));
                  }
                }}
                className={`w-full p-2 border rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
                  error ? "border-red-500" : "border-gray-600"
                } ${readOnly ? "bg-gray-600" : ""}`}
                rows={3}
                placeholder={placeholder}
                readOnly={readOnly}
              />
              {error && (
                <p className="text-red-300 text-xs mt-1 font-medium">{error}</p>
              )}
            </>
          ) : type === "date-masked" ? (
            // --- DATE MASKED INPUT (DD/MM/YYYY) ---
            <>
              <input
                type="text"
                value={fieldValue || ""}
                onChange={(e) => update(key, e.target.value, false, true)} // Trigger Date Logic
                maxLength={10}
                className={`w-full p-2 border rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  error ? "border-red-500" : "border-gray-600"
                } ${readOnly ? "bg-gray-600" : ""}`}
                placeholder="DD/MM/YYYY"
                readOnly={readOnly}
              />
              {error && (
                <p className="text-red-300 text-xs mt-1 font-medium">{error}</p>
              )}
            </>
          ) : (
            <>
              <input
                type={type === "number" ? "number" : "text"}
                value={fieldValue || ""}
                onChange={(e) => {
                  let newValue = e.target.value;
                  // Apply contact number filter (10 digits only)
                  if (key === "contact") {
                    newValue = filterContactNumber(newValue);
                  }
                  // Apply integer-only filter if this is an integer-only field
                  else if (isIntegerOnlyField(key)) {
                    newValue = filterIntegerOnly(newValue);
                  } else if (isTextOnly) {
                    newValue = filterTextOnly(newValue);
                  }
                  update(key, newValue, isTextOnly);
                }}
                onBlur={() => {
                  if (required && !fieldValue) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      [key]: "This field is required",
                    }));
                  }
                }}
                maxLength={key === "contact" ? 10 : undefined}
                className={`w-full p-2 border rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  error ? "border-red-500" : "border-gray-600"
                } ${readOnly ? "bg-gray-600" : ""}`}
                placeholder={placeholder}
                readOnly={readOnly}
              />
              {error && (
                <p className="text-red-300 text-xs mt-1 font-medium">{error}</p>
              )}
            </>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white uppercase">
          REGISTRATION DETAILS
        </h3>
      </div>

      {/* SECTION 1 — PERSONAL IDENTIFICATION */}
      <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
        {renderSectionHeader(1, "PERSONAL IDENTIFICATION")}
        {expandedSections.has(1) && (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full border-collapse min-w-[500px]">
              <tbody>
                {renderField("First Name", "firstName", "text", undefined, "Enter first name", false, true)}
                {renderField("Initials", "initials", "text", undefined, "Enter initials")}
                {renderField("Last Name", "lastName", "text", undefined, "Enter last name", false, true)}
                {renderField("Full Name ", "fullName", "text", undefined, "", true)}
                {renderField("Photograph Upload", "photograph", "file")}
                {renderField(
                  "Service Branch",
                  "serviceBranch",
                  "select",
                  ["Army", "Air Force", "Navy"]
                )}
                {renderField("Service Number", "serviceNumber", "text", undefined, "Enter service number")}
                {renderField("Rank", "rank", "text", undefined, "Enter rank")}
                {renderField("Current Appointment / Designation", "currentAppointment", "text", undefined, "Enter appointment/designation")}
                
                {/* --- DATE FIELDS HERE --- */}
                {renderField("Enlistment Date", "enlistmentDate", "date-masked")}
                
                {renderField("Years in Service (Auto-Calculated)", "yearsInService", "text", undefined, "", true)}
                {renderField("Years in Special Forces (Auto-Calculated)", "yearsInSpecialForces", "text", undefined, "Enter years")}
                
                {/* --- DATE FIELDS HERE --- */}
                {renderField("Date of Birth", "dob", "date-masked")}
                
                {renderField("Age (Auto-Calculated)", "age", "text", undefined, "", true)}
                {renderField("Gender", "gender", "select", ["Male", "Female", "Other"])}
                {renderField("Blood Group", "bloodGroup", "select", ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])}
                {renderField("Dominant Hand", "dominantHand", "select", ["Left", "Right", "Ambidextrous"])}
                {renderField("Dominant Leg", "dominantLeg", "select", ["Left", "Right"])}
                {renderField("Dominant Eye", "dominantEye", "select", ["Left", "Right"])}
                {renderField("Service ID Scan Upload", "serviceIdScan", "file")}
                {renderField("Medical Category Document Upload", "medicalCategoryDoc", "file")}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2 — SERVICE HISTORY & QUALIFICATIONS */}
      <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
        {renderSectionHeader(2, "SERVICE HISTORY & QUALIFICATIONS")}
        {expandedSections.has(2) && (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full border-collapse min-w-[500px]">
              <tbody>
                {renderField("Total Years in Armed Forces", "totalYearsArmedForces", "text", undefined, "Enter years")}
                {renderField("Total Years in Combat Role", "totalYearsCombatRole", "text", undefined, "Enter years")}
                {renderField("Total Years in Special Forces", "totalYearsSpecialForces", "text", undefined, "Enter years")}
                <tr className="border-b border-gray-700">
                  <td className="w-1/3 p-3 border-r border-gray-700 bg-gray-700 align-top">
                    <label className="text-sm font-medium text-gray-900">Special Forces Courses (with Certificate Upload)</label>
                  </td>
                  <td className="w-2/3 p-3">
                    <div className="space-y-3">
                      {[
                        "Para SF Probation",
                        "Garud Commando Qualification",
                        "MARCOS Probation",
                        "Combat Freefall (Static Line, HALO, HAHO)",
                        "Para Basic Course",
                        "CIJW Vairengte",
                        "HAWS",
                        "JWS",
                        "Desert Warfare",
                        "Amphibious Warfare",
                        "Combat Diver Qualification",
                        "SERE Training",
                        "CQB Course",
                        "Sniper Course",
                        "Breacher Course",
                        "UAV/Drone Recon Course",
                      ].map((course) => {
                        const courseData = (form.sfCourses as any)?.[course];
                        const certificateFile = (form.sfCourses as any)?.[course + "_cert"];
                        return (
                          <div key={course} className="border border-gray-600 rounded-lg p-3 bg-gray-700">
                            <div className="flex items-center gap-2 mb-2">
                              <input
                                type="checkbox"
                                checked={courseData || false}
                                onChange={(e) => updateNested("sfCourses", course, e.target.checked)}
                                className="w-4 h-4"
                              />
                              <label className="text-sm font-medium text-gray-700 flex-1">{course}</label>
                            </div>
                            {courseData && (
                              <div className="ml-6 mt-2">
                                <label className="text-xs text-gray-600 mb-1 block">Certificate Upload</label>
                                {certificateFile ? (
                                  <div className="flex items-center gap-2 p-2 bg-white border border-gray-300 rounded">
                                    <span className="text-xs text-gray-700 flex-1 truncate">
                                      {certificateFile.name}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const files = { ...(form.sfCourses as any) };
                                        files[course + "_cert"] = null;
                                        update("sfCourses", files);
                                      }}
                                      className="text-red-600 hover:text-red-800 p-1"
                                      title="Remove certificate"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="relative">
                                    <label className="block">
                                      <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg bg-white/50 hover:border-green-500 hover:bg-green-50/50 transition cursor-pointer">
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-5 w-5 text-gray-500"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                          />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Choose File</span>
                                        <span className="text-xs text-gray-500">(PDF, JPG, PNG)</span>
                                      </div>
                                      <input
                                        type="file"
                                        onChange={(e) => {
                                          const files = { ...(form.sfCourses as any) };
                                          files[course + "_cert"] = e.target.files?.[0] || null;
                                          update("sfCourses", files);
                                        }}
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                      />
                                    </label>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="w-1/3 p-3 border-r border-gray-700 bg-gray-700 align-top">
                    <label className="text-sm font-medium text-gray-900">Weapon Mastery Qualification</label>
                  </td>
                  <td className="w-2/3 p-3">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Primary Rifle</label>
                        <select
                          value={form.primaryRifle}
                          onChange={(e) => update("primaryRifle", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-</option>
                          <option>AK-47</option>
                          <option>INSAS</option>
                          <option>Tavor</option>
                          <option>M4</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Secondary Weapon</label>
                        <select
                          value={form.secondaryWeapon}
                          onChange={(e) => update("secondaryWeapon", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-</option>
                          <option>Pistol</option>
                          <option>Revolver</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">LMG/MMG</label>
                        <select
                          value={form.lmgMmg}
                          onChange={(e) => update("lmgMmg", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-</option>
                          <option>Yes</option>
                          <option>No</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Sniper Systems</label>
                        <select
                          value={form.sniperSystems}
                          onChange={(e) => update("sniperSystems", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-</option>
                          <option>Yes</option>
                          <option>No</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Underwater Weapons</label>
                        <select
                          value={form.underwaterWeapons}
                          onChange={(e) => update("underwaterWeapons", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-</option>
                          <option>Yes</option>
                          <option>No</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">CQB Weapons</label>
                        <select
                          value={form.cqbWeapons}
                          onChange={(e) => update("cqbWeapons", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-</option>
                          <option>Yes</option>
                          <option>No</option>
                        </select>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="w-1/3 p-3 border-r border-gray-700 bg-gray-700 align-top">
                    <label className="text-sm font-medium text-gray-900">Annual Firing Scores</label>
                  </td>
                  <td className="w-2/3 p-3">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Rifle</label>
                        <input
                          type="text"
                          value={form.rifleScore}
                          onChange={(e) => update("rifleScore", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter score"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Pistol</label>
                        <input
                          type="text"
                          value={form.pistolScore}
                          onChange={(e) => update("pistolScore", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter score"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Night Firing</label>
                        <input
                          type="text"
                          value={form.nightFiringScore}
                          onChange={(e) => update("nightFiringScore", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter score"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Moving Target</label>
                        <input
                          type="text"
                          value={form.movingTargetScore}
                          onChange={(e) => update("movingTargetScore", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter score"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 3 — OPERATIONAL DEPLOYMENT RECORD */}
      <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
        {renderSectionHeader(3, "OPERATIONAL DEPLOYMENT RECORD")}
        {expandedSections.has(3) && (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full border-collapse min-w-[500px]">
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="w-1/3 p-3 border-r border-gray-700 bg-gray-700 align-top">
                    <label className="text-sm font-medium text-gray-900">Terrain Deployment Exposure</label>
                  </td>
                  <td className="w-2/3 p-3">
                    <div className="space-y-2">
                      {[
                        "High Altitude",
                        "Super High Altitude",
                        "Jungle",
                        "Desert",
                        "Maritime/Littoral",
                        "Urban CT",
                        "CI/COIN Areas",
                      ].map((terrain) => (
                        <div key={terrain} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={(form.terrainExposure as any)?.[terrain] || false}
                            onChange={(e) => updateNested("terrainExposure", terrain, e.target.checked)}
                            className="w-4 h-4"
                          />
                          <label className="text-sm text-gray-700">{terrain}</label>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="w-1/3 p-3 border-r border-gray-700 bg-gray-700 align-top">
                    <label className="text-sm font-medium text-gray-900">Mission Exposure</label>
                  </td>
                  <td className="w-2/3 p-3">
                    <div className="space-y-2">
                      {[
                        "Counter-Terror",
                        "Counter-Insurgency",
                        "High-Risk Entry",
                        "Hostage Rescue",
                        "Recon & Surveillance",
                        "Para Drop",
                        "HAHO / HALO",
                        "Sniper Ops",
                        "Amphibious Ops",
                        "Dive Ops",
                      ].map((mission) => (
                        <div key={mission} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={(form.missionExposure as any)?.[mission] || false}
                            onChange={(e) => updateNested("missionExposure", mission, e.target.checked)}
                            className="w-4 h-4"
                          />
                          <label className="text-sm text-gray-700">{mission}</label>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="w-1/3 p-3 border-r border-gray-700 bg-gray-700 align-top">
                    <label className="text-sm font-medium text-gray-900">Load Carriage</label>
                  </td>
                  <td className="w-2/3 p-3">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Typical Load (kg)</label>
                        <input
                          type="number"
                          value={form.typicalLoad}
                          onChange={(e) => update("typicalLoad", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter kg"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Maximum Load (kg)</label>
                        <input
                          type="number"
                          value={form.maximumLoad}
                          onChange={(e) => update("maximumLoad", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter kg"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Longest Mission Duration</label>
                        <input
                          type="text"
                          value={form.longestMissionDuration}
                          onChange={(e) => update("longestMissionDuration", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter duration"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Max Continuous Movement Under Load</label>
                        <input
                          type="text"
                          value={form.maxContinuousMovement}
                          onChange={(e) => update("maxContinuousMovement", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter details"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="w-1/3 p-3 border-r border-gray-700 bg-gray-700 align-top">
                    <label className="text-sm font-medium text-gray-900">Night Operations</label>
                  </td>
                  <td className="w-2/3 p-3">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Night Ops per Month</label>
                        <input
                          type="number"
                          value={form.nightOpsPerMonth}
                          onChange={(e) => update("nightOpsPerMonth", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter number"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">NVD Proficiency</label>
                        <select
                          value={form.nvdProficiency}
                          onChange={(e) => update("nvdProficiency", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-</option>
                          <option>Beginner</option>
                          <option>Intermediate</option>
                          <option>Advanced</option>
                          <option>Expert</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Night Navigation Rating</label>
                        <select
                          value={form.nightNavigationRating}
                          onChange={(e) => update("nightNavigationRating", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-</option>
                          <option>1</option>
                          <option>2</option>
                          <option>3</option>
                          <option>4</option>
                          <option>5</option>
                          <option>6</option>
                          <option>7</option>
                          <option>8</option>
                          <option>9</option>
                          <option>10</option>
                        </select>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 4 — MEDICAL, INJURY & DURABILITY */}
      <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
        {renderSectionHeader(4, "MEDICAL, INJURY & DURABILITY")}
        {expandedSections.has(4) && (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full border-collapse min-w-[500px]">
              <tbody>
                {renderField("Medical Category (SHAPE / Air Force / Navy)", "medicalCategory", "select", ["SHAPE-1", "SHAPE-2", "SHAPE-3", "SHAPE-4", "SHAPE-5", "Fit", "Temporary Unfit", "Permanent Unfit"])}
                {renderField("Medical Downgrades/Upgrades", "medicalDowngrades", "textarea", undefined, "Enter details (text only, no numbers)")}
                <tr className="border-b border-gray-700">
                  <td className="w-1/3 p-3 border-r border-gray-700 bg-gray-700 align-top">
                    <label className="text-sm font-medium text-gray-900">Injury History (5-Year Log)</label>
                  </td>
                  <td className="w-2/3 p-3">
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, idx) => {
                        const injury = (form.injuryHistory as any[])[idx] || {};
                        return (
                          <div key={idx} className="border p-3 rounded space-y-2">
                            <h5 className="font-medium text-gray-700">Injury {idx + 1}</h5>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-gray-600">Body Area</label>
                                <select
                                  value={injury.bodyArea || ""}
                                  onChange={(e) => {
                                    const newHistory = [...(form.injuryHistory as any[])];
                                    newHistory[idx] = { ...newHistory[idx], bodyArea: e.target.value };
                                    update("injuryHistory", newHistory, false);
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                >
                                  <option value="">-</option>
                                  <option>Head</option>
                                  <option>Neck</option>
                                  <option>Shoulder</option>
                                  <option>Upper Back</option>
                                  <option>Lower Back</option>
                                  <option>Hip</option>
                                  <option>Knee</option>
                                  <option>Ankle</option>
                                  <option>Foot</option>
                                  <option>Wrist</option>
                                  <option>Elbow</option>
                                  <option>Other</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-gray-600">Injury Type</label>
                                <select
                                  value={injury.injuryType || ""}
                                  onChange={(e) => {
                                    const newHistory = [...(form.injuryHistory as any[])];
                                    newHistory[idx] = { ...newHistory[idx], injuryType: e.target.value };
                                    update("injuryHistory", newHistory);
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                >
                                  <option value="">-</option>
                                  <option>Fracture</option>
                                  <option>Sprain</option>
                                  <option>Strain</option>
                                  <option>Contusion</option>
                                  <option>Laceration</option>
                                  <option>Other</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-gray-600">Severity Grade</label>
                                <select
                                  value={injury.severity || ""}
                                  onChange={(e) => {
                                    const newHistory = [...(form.injuryHistory as any[])];
                                    newHistory[idx] = { ...newHistory[idx], severity: e.target.value };
                                    update("injuryHistory", newHistory);
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                >
                                  <option value="">-</option>
                                  <option>Mild</option>
                                  <option>Moderate</option>
                                  <option>Severe</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-gray-600">Occurrence Type</label>
                                <select
                                  value={injury.occurrence || ""}
                                  onChange={(e) => {
                                    const newHistory = [...(form.injuryHistory as any[])];
                                    newHistory[idx] = { ...newHistory[idx], occurrence: e.target.value };
                                    update("injuryHistory", newHistory);
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                >
                                  <option value="">-</option>
                                  <option>Training</option>
                                  <option>Operational</option>
                                  <option>Accident</option>
                                  <option>Other</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-xs text-gray-600">Recurrence</label>
                                <select
                                  value={injury.recurrence || ""}
                                  onChange={(e) => {
                                    const newHistory = [...(form.injuryHistory as any[])];
                                    newHistory[idx] = { ...newHistory[idx], recurrence: e.target.value };
                                    update("injuryHistory", newHistory);
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                >
                                  <option value="">-</option>
                                  <option>Yes</option>
                                  <option>No</option>
                                </select>
                              </div>
                              <div className="col-span-2">
                                <label className="text-xs text-gray-600">Treatment Received</label>
                                <textarea
                                  value={injury.treatment || ""}
                                  onChange={(e) => {
                                    const newHistory = [...(form.injuryHistory as any[])];
                                    newHistory[idx] = { ...newHistory[idx], treatment: e.target.value };
                                    update("injuryHistory", newHistory, false);
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-vertical"
                                  placeholder="Enter treatment details"
                                  rows={2}
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="text-xs text-gray-600">Rehab Status</label>
                                <select
                                  value={injury.rehab || ""}
                                  onChange={(e) => {
                                    const newHistory = [...(form.injuryHistory as any[])];
                                    newHistory[idx] = { ...newHistory[idx], rehab: e.target.value };
                                    update("injuryHistory", newHistory);
                                  }}
                                  className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                >
                                  <option value="">-</option>
                                  <option>Completed</option>
                                  <option>Ongoing</option>
                                  <option>Not Started</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="w-1/3 p-3 border-r border-gray-700 bg-gray-700 align-top">
                    <label className="text-sm font-medium text-gray-900">Chronic Conditions</label>
                  </td>
                  <td className="w-2/3 p-3">
                    <div className="space-y-2">
                      {[
                        "Lower Back Issues",
                        "Knee Degeneration",
                        "Shoulder Instability",
                        "Stress Fractures",
                        "Respiratory Limitations",
                        "Hypertension",
                        "Barotrauma",
                        "Altitude Intolerance",
                      ].map((condition) => (
                        <div key={condition} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={(form.chronicConditions as any)?.[condition] || false}
                            onChange={(e) => updateNested("chronicConditions", condition, e.target.checked)}
                            className="w-4 h-4"
                          />
                          <label className="text-sm text-gray-700">{condition}</label>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="w-1/3 p-3 border-r border-gray-700 bg-gray-700 align-top">
                    <label className="text-sm font-medium text-gray-900">Pain Mapping</label>
                  </td>
                  <td className="w-2/3 p-3">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Pain Location</label>
                        <input
                          type="text"
                          value={form.painLocation}
                          onChange={(e) => update("painLocation", filterTextOnly(e.target.value), true)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter location (text only)"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Pain Intensity</label>
                        <select
                          value={form.painIntensity}
                          onChange={(e) => update("painIntensity", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-</option>
                          <option>1</option>
                          <option>2</option>
                          <option>3</option>
                          <option>4</option>
                          <option>5</option>
                          <option>6</option>
                          <option>7</option>
                          <option>8</option>
                          <option>9</option>
                          <option>10</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Pain Triggers</label>
                        <textarea
                          value={form.painTriggers}
                          onChange={(e) => update("painTriggers", filterTextOnly(e.target.value), true)}
                          className="w-full p-2 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 resize-vertical"
                          rows={3}
                          placeholder="Enter triggers (text only, no numbers)"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 5 — SLEEP, HYDRATION & RECOVERY */}
      <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
        {renderSectionHeader(5, "SLEEP, HYDRATION & RECOVERY")}
        {expandedSections.has(5) && (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full border-collapse min-w-[500px]">
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="w-1/3 p-3 border-r border-gray-700 bg-gray-700 align-top">
                    <label className="text-sm font-medium text-gray-900">Sleep Profile</label>
                  </td>
                  <td className="w-2/3 p-3">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Average Sleep Hours</label>
                        <input
                          type="number"
                          value={form.avgSleepHours}
                          onChange={(e) => update("avgSleepHours", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter hours"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Sleep Quality</label>
                        <select
                          value={form.sleepQuality}
                          onChange={(e) => update("sleepQuality", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-</option>
                          <option>Poor</option>
                          <option>Fair</option>
                          <option>Good</option>
                          <option>Excellent</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Sleep Disruptions</label>
                        <select
                          value={form.sleepDisruptions}
                          onChange={(e) => update("sleepDisruptions", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-</option>
                          <option>None</option>
                          <option>Rare</option>
                          <option>Occasional</option>
                          <option>Frequent</option>
                          <option>Constant</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Sleep Deprivation Exposure</label>
                        <select
                          value={form.sleepDeprivationExposure}
                          onChange={(e) => update("sleepDeprivationExposure", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-</option>
                          <option>None</option>
                          <option>Rare</option>
                          <option>Occasional</option>
                          <option>Frequent</option>
                          <option>Constant</option>
                        </select>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="w-1/3 p-3 border-r border-gray-700 bg-gray-700 align-top">
                    <label className="text-sm font-medium text-gray-900">Hydration</label>
                  </td>
                  <td className="w-2/3 p-3">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Water Intake</label>
                        <input
                          type="text"
                          value={form.waterIntake}
                          onChange={(e) => update("waterIntake", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter daily intake"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Electrolyte Use</label>
                        <select
                          value={form.electrolyteUse}
                          onChange={(e) => update("electrolyteUse", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-</option>
                          <option>Yes</option>
                          <option>No</option>
                          <option>Occasionally</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Hydration Score</label>
                        <select
                          value={form.hydrationScore}
                          onChange={(e) => update("hydrationScore", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-</option>
                          <option>1</option>
                          <option>2</option>
                          <option>3</option>
                          <option>4</option>
                          <option>5</option>
                          <option>6</option>
                          <option>7</option>
                          <option>8</option>
                          <option>9</option>
                          <option>10</option>
                        </select>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="w-1/3 p-3 border-r border-gray-700 bg-gray-700 align-top">
                    <label className="text-sm font-medium text-gray-900">Recovery</label>
                  </td>
                  <td className="w-2/3 p-3">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Physiotherapy Frequency</label>
                        <select
                          value={form.physiotherapyFrequency}
                          onChange={(e) => update("physiotherapyFrequency", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-</option>
                          <option>Daily</option>
                          <option>Weekly</option>
                          <option>Monthly</option>
                          <option>As Needed</option>
                          <option>Never</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Manual Therapy</label>
                        <select
                          value={form.manualTherapy}
                          onChange={(e) => update("manualTherapy", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-</option>
                          <option>Yes</option>
                          <option>No</option>
                          <option>Occasionally</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Hot/Cold Therapy</label>
                        <select
                          value={form.hotColdTherapy}
                          onChange={(e) => update("hotColdTherapy", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-</option>
                          <option>Yes</option>
                          <option>No</option>
                          <option>Occasionally</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Breathing Drills</label>
                        <select
                          value={form.breathingDrills}
                          onChange={(e) => update("breathingDrills", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-</option>
                          <option>Yes</option>
                          <option>No</option>
                          <option>Occasionally</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Supplement Use</label>
                        <select
                          value={form.supplementUse}
                          onChange={(e) => update("supplementUse", e.target.value)}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">-</option>
                          <option>Yes</option>
                          <option>No</option>
                          <option>Occasionally</option>
                        </select>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 6 — TRAINING LOAD & DUTY LOAD */}
      <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
        {renderSectionHeader(6, "TRAINING LOAD & DUTY LOAD")}
        {expandedSections.has(6) && (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full border-collapse min-w-[500px]">
              <tbody>
                <tr className="border-b border-gray-700">
                  <td className="w-1/3 p-3 border-r border-gray-700 bg-gray-700 align-top">
                    <label className="text-sm font-medium text-gray-900">Physical Training Load</label>
                  </td>
                  <td className="w-2/3 p-3">
                    <div className="space-y-3">
                      {[
                        { key: "runningVolume", label: "Running Volume", placeholder: "Enter volume per week" },
                        { key: "swimmingVolume", label: "Swimming Volume", placeholder: "Enter volume per week" },
                        { key: "loadMarchVolume", label: "Load March Volume", placeholder: "Enter volume per week" },
                        { key: "strengthSessions", label: "Strength Sessions", placeholder: "Enter sessions per week" },
                        { key: "tacticalDrills", label: "Tactical Drills", placeholder: "Enter drills per week" },
                        { key: "shootingSessions", label: "Shooting Sessions", placeholder: "Enter sessions per week" },
                        { key: "maritimeSkills", label: "Maritime Skills", placeholder: "Enter hours per week" },
                        { key: "airborneTasks", label: "Airborne Tasks", placeholder: "Enter tasks per week" },
                      ].map((field) => (
                        <div key={field.key}>
                          <label className="text-xs text-gray-600 mb-1 block">{field.label}</label>
                          <input
                            type="text"
                            value={form[field.key as keyof typeof form] as string}
                            onChange={(e) => update(field.key, e.target.value)}
                            className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={field.placeholder}
                          />
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-700">
                  <td className="w-1/3 p-3 border-r border-gray-700 bg-gray-700 align-top">
                    <label className="text-sm font-medium text-gray-900">Duty Load</label>
                  </td>
                  <td className="w-2/3 p-3">
                    <div className="space-y-3">
                      {[
                        { key: "guardDuty", label: "Guard Duty", placeholder: "Enter hours per week" },
                        { key: "fieldExerciseHours", label: "Field Exercise Hours", placeholder: "Enter hours per week" },
                        { key: "deckDuty", label: "Deck Duty", placeholder: "Enter hours per week" },
                        { key: "standToHoursAltitude", label: "Stand-To Hours at Altitude", placeholder: "Enter hours per week" },
                      ].map((field) => (
                        <div key={field.key}>
                          <label className="text-xs text-gray-600 mb-1 block">{field.label}</label>
                          <input
                            type="text"
                            value={form[field.key as keyof typeof form] as string}
                            onChange={(e) => update(field.key, e.target.value)}
                            className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={field.placeholder}
                          />
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 7 — SELF-ASSESSMENT */}
      <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
        {renderSectionHeader(7, "SELF-ASSESSMENT")}
        {expandedSections.has(7) && (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full border-collapse min-w-[500px]">
              <tbody>
                {renderField("Strength Areas", "strengthAreas", "textarea", undefined, "Enter strength areas (text only, no numbers)")}
                {renderField("Weak Areas", "weakAreas", "textarea", undefined, "Enter weak areas (text only, no numbers)")}
                <tr className="border-b border-gray-700">
                  <td className="w-1/3 p-3 border-r border-gray-700 bg-gray-700 align-top">
                    <label className="text-sm font-medium text-gray-900">Terrain Readiness (1–10)</label>
                  </td>
                  <td className="w-2/3 p-3">
                    <div className="space-y-3">
                      {[
                        { key: "terrainReadinessHighAltitude", label: "High Altitude" },
                        { key: "terrainReadinessJungle", label: "Jungle" },
                        { key: "terrainReadinessDesert", label: "Desert" },
                        { key: "terrainReadinessMaritime", label: "Maritime" },
                        { key: "terrainReadinessUrban", label: "Urban" },
                      ].map((field) => (
                        <div key={field.key}>
                          <label className="text-xs text-gray-600 mb-1 block">{field.label}</label>
                          <select
                            value={form[field.key as keyof typeof form] as string}
                            onChange={(e) => update(field.key, e.target.value)}
                            className="w-full p-2 border border-gray-600 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">-</option>
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>
                            <option>6</option>
                            <option>7</option>
                            <option>8</option>
                            <option>9</option>
                            <option>10</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
                {renderField("Mission Readiness Score (1–10)", "missionReadinessScore", "select", ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"])}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 8 — COMMANDER ASSESSMENT */}
      <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
        {renderSectionHeader(8, "COMMANDER ASSESSMENT")}
        {expandedSections.has(8) && (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full border-collapse min-w-[500px]">
              <tbody>
                {renderField("Observed Strengths", "observedStrengths", "textarea", undefined, "Enter observed strengths (text only, no numbers)")}
                {renderField("Observed Limitations", "observedLimitations", "textarea", undefined, "Enter observed limitations (text only, no numbers)")}
                {renderField("Terrain Suitability", "terrainSuitability", "textarea", undefined, "Enter terrain suitability (text only, no numbers)")}
                {renderField("Deployment Readiness", "deploymentReadiness", "select", ["Ready", "Conditional", "Not Ready"])}
                {renderField("Requalification Requirement", "requalificationRequirement", "select", ["Yes", "No", "Partial"])}
                {renderField("Recommended S&C Focus Areas", "recommendedScFocusAreas", "textarea", undefined, "Enter recommended focus areas (text only, no numbers)")}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Existing fields that should remain */}
      <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
        <div className="p-4 bg-gray-100 border-b border-gray-300">
          <h4 className="text-lg font-bold text-gray-900">ADDITIONAL DETAILS</h4>
        </div>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full border-collapse min-w-[500px]">
            <tbody>
              {renderField("Contact Number", "contact", "text", undefined, "Enter 10-digit contact number")}
              {renderField("Email ID", "email", "text", undefined, "Enter email address")}
              {renderField("Training Department", "trainingDepartment", "text", undefined, "Enter training department (text only)")}
              
              {/* --- DATE FIELD HERE --- */}
              {renderField("Date of Assessment", "dateOfAssessment", "date-masked")}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        {isSaved && (
          <span className="text-green-600 text-sm flex items-center">
            ✓ Saved successfully
          </span>
        )}
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 font-medium"
        >
          Save Registration Details
        </button>
      </div>
    </div>
  );
}