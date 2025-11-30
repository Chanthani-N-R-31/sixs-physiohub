// src/lib/statusUtils.ts

export type DomainStatus = "completed" | "in_progress" | "pending";

// --- 1. DEFINE THE SCHEMA (The Checklist) ---
// This lists every field that MUST be filled for a section to be "Complete".
// If you want a field to be optional (e.g., "notes"), remove it from this list.

const PHYSIO_SCHEMA = {
  registrationDetails: [
    "firstName", "lastName", "rank", "serviceNumber", "dob", "age", 
    "gender", "bloodGroup", "serviceBranch", "enlistmentDate"
    // Add others from RegistrationDetails as needed
  ],
  injuryHistory: [
    "chiefComplaints", "history", "painSeverity", "diagnosis", "modeOfTreatment"
    // "previousInjuries..." fields are optional if the patient has no history
  ],
  staticPosture: [
    "headTilt", "shoulderAlignment", "trunkAlignment", "pelvicAlignment", 
    "kneeAlignmentAnterior", "headAlignmentLat", "shoulderAlignmentLat", 
    "spinalCurves", "pelvicTilt", "kneeAlignmentLat"
  ],
  rom: [
    "cervFlex", "cervExt", "cervLatFlexL", "cervLatFlexR", "cervRotL", "cervRotR",
    "thorFlex", "thorExt", "thorLatFlexL", "thorLatFlexR", "thorRotL", "thorRotR",
    "shFlexL", "shFlexR", "shAbdL", "shAbdR", "shERL", "shERR", "shIRL", "shIRR",
    "hipFlexL", "hipFlexR", "hipAbdL", "hipAbdR", "hipERL", "hipERR", "hipIRL", "hipIRR",
    "kneeFlexL", "kneeFlexR", "kneeExtL", "kneeExtR",
    "ankleDFL", "ankleDFR", "anklePFL", "anklePFR",
    "sitAndReach", "poplitealAngle", "thomasTest"
  ],
  strengthStability: [
    "plankTime", "sidePlankL", "sidePlankR", 
    "staticBalance", "dynamicBalance"
  ],
  fms: [
    "deepSquat", "hurdleL", "hurdleR", "lungeL", "lungeR", 
    "shoulderMobL", "shoulderMobR", "aslrL", "aslrR", 
    "trunkStability", "rotaryL", "rotaryR"
  ]
};

const BIOMECH_SCHEMA = {
  metadata: [
    "height", "mass", "dominantSide", "footStrikeHabit", 
    "environment", "footwearType", "warmupStandardized"
  ],
  running: [
    "runningSpeed", "cadence", "strideLength", "loadCondition", "surfaceType"
  ],
  spatiotemporal: [
    "speed", "cadence", "contactTime", "flightTime", "dutyFactor", "asymmetryIndex"
  ],
  kinematic: [
    "footPitchAngleIC", "peakFootAngularVelocity", "tibialRotationROM", 
    "trunkInclination", "pelvicObliquity", "trunkSway", 
    "kneeFlexionMidstance", "plantarflexionPushOff"
  ],
  impact: [
    "peakTibialAcceleration", "tibialShockLoadingRate", 
    "verticalTrunkAcceleration", "verticalStiffness"
  ],
  variability: [
    "cadenceDrift", "contactTimeChange", "stepVariability", 
    "dynamicStability", "fatigueSymmetryChange"
  ],
  loadCarriage: [
    "deltaSpeed", "deltaContactTime", "deltaTibialAcceleration", 
    "deltaTrunkSway", "loadEffectIndex"
  ],
  strength: [
    // For nested objects, we handle them in the recursive checker
    "isokineticKnee", "isokineticAnkle", "nordicHamstring"
  ],
  powerTests: [
    "cmj", "slCmj", "squatJump", "slSj", "dropJump", "broadJump"
  ]
};

const NUTRITION_SCHEMA = {
  nutrition: [
    "warmUpActivity",
    "warmUpDuration", 
    "environment",
    "loadConditions",
    "restBetweenTests"
  ]
};

const PHYSIOLOGY_SCHEMA = {
  physiology: [
    "imuSensorsUsed",
    "samplingRate",
    "measurementRange",
    "calibrationType",
    "mountingMethod",
    "syncMethod"
  ]
};

const PSYCHOLOGY_SCHEMA = {
  psychology: [
    "stairs",
    "turns",
    "unevenGround",
    "weaponHandling"
  ]
};

// --- 2. HELPER: CHECK IF A VALUE IS "FILLED" ---
const isValueFilled = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (typeof value === "number") return true; // 0 is a valid number
  if (typeof value === "boolean") return true; // true/false are valid
  
  // Handle Nested Objects (like isokineticKnee: { peakTorque: 100 })
  if (typeof value === "object") {
    if (Object.keys(value).length === 0) return false; // Empty object
    // Recursively check all values inside the object
    return Object.values(value).every(v => isValueFilled(v));
  }
  
  return true;
};

// --- 3. CALCULATE DOMAIN STATUS ---
export const calculateDomainStatus = (domain: string, fullEntryData: any): DomainStatus => {
  if (!fullEntryData) return "pending";

  // Handle domains with schemas (Physiotherapy, Biomechanics)
  if (domain === "Physiotherapy" || domain === "Biomechanics") {
    const schema: Record<string, string[]> = domain === "Physiotherapy" ? PHYSIO_SCHEMA : BIOMECH_SCHEMA;
    
    // Calculate status for domains with schemas
    const sections = Object.keys(schema);
    let totalFields = 0;
    let filledFields = 0;

    sections.forEach((sectionKey: string) => {
      const requiredFields = schema[sectionKey] || [];
      const sectionData = fullEntryData[sectionKey] || {};

      requiredFields.forEach((field: string) => {
        totalFields++;
        if (isValueFilled(sectionData[field])) {
          filledFields++;
        }
      });
    });

    if (filledFields === 0) return "pending";
    if (filledFields === totalFields) return "completed";
    
    return "in_progress";
  }
  
  // Handle other domains (Physiology, Nutrition, Psychology)
  if (domain === "Physiology" || domain === "Nutrition" || domain === "Psychology") {
    const domainKey = domain.toLowerCase();
    const domainData = fullEntryData[domainKey];
    
    if (!domainData || typeof domainData !== 'object') {
      return "pending";
    }
    
    // Get the appropriate schema
    let schema: Record<string, string[]> = {};
    if (domain === "Nutrition") schema = NUTRITION_SCHEMA;
    else if (domain === "Physiology") schema = PHYSIOLOGY_SCHEMA;
    else if (domain === "Psychology") schema = PSYCHOLOGY_SCHEMA;
    
    // Check all required fields in the schema
    let totalFields = 0;
    let filledFields = 0;
    
    const sections = Object.keys(schema);
    sections.forEach((sectionKey: string) => {
      const requiredFields = schema[sectionKey] || [];
      // These domains store data directly, not in sections
      const sectionData = domainData;
      
      requiredFields.forEach((field: string) => {
        totalFields++;
        if (isValueFilled(sectionData[field])) {
          filledFields++;
        }
      });
    });
    
    if (filledFields === 0) return "pending";
    if (filledFields === totalFields) return "completed";
    
    return "in_progress";
  }
  
  // Unknown domain
  return "pending";
};

// --- 4. CALCULATE GLOBAL PATIENT STATUS ---
export const calculateGlobalStatus = (
  domainStatuses: Record<string, DomainStatus>
): "completed" | "in_progress" | "pending" => {
  
  // The 5 specific domains that define "Complete"
  const requiredDomains = [
    "Physiotherapy", 
    "Biomechanics", 
    "Physiology", 
    "Nutrition", 
    "Psychology"
  ];
  
  // Check 1: Are ALL 5 domains explicitly "completed"?
  const allCompleted = requiredDomains.every(d => domainStatuses[d] === "completed");
  if (allCompleted) return "completed";

  // Check 2: Is ANY domain "in_progress" or "completed"?
  const anyStarted = requiredDomains.some(d => 
    domainStatuses[d] === "completed" || domainStatuses[d] === "in_progress"
  );
  if (anyStarted) return "in_progress";

  return "pending";
};

// --- 5. GET ALL DOMAIN STATUSES ---
export interface DomainStatusMap {
  Physiotherapy: DomainStatus;
  Biomechanics: DomainStatus;
  Physiology: DomainStatus;
  Nutrition: DomainStatus;
  Psychology: DomainStatus;
}

export function getDomainStatuses(entryData: any): DomainStatusMap {
  if (!entryData) {
    return {
      Physiotherapy: "pending",
      Biomechanics: "pending",
      Physiology: "pending",
      Nutrition: "pending",
      Psychology: "pending",
    };
  }

  // Calculate status for each domain from the actual data
  return {
    Physiotherapy: calculateDomainStatus("Physiotherapy", entryData),
    Biomechanics: calculateDomainStatus("Biomechanics", entryData),
    Physiology: calculateDomainStatus("Physiology", entryData),
    Nutrition: calculateDomainStatus("Nutrition", entryData),
    Psychology: calculateDomainStatus("Psychology", entryData),
  };
}

// --- 6. HELPER FUNCTIONS FOR UI ---
export function getStatusLabel(status: DomainStatus): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In Progress";
    case "pending":
      return "Not Started";
    default:
      return "Unknown";
  }
}

export function getStatusBadgeClass(status: DomainStatus): string {
  switch (status) {
    case "completed":
      return "bg-green-50 text-green-700 border-green-200";
    case "in_progress":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "pending":
      return "bg-gray-50 text-gray-600 border-gray-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}