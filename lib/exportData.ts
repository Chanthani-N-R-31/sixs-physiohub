// Utility functions for exporting data in various formats

import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

/**
 * Flattens nested objects for CSV/Excel export
 */
export function flattenObject(obj: any, prefix = "", maxDepth = 5): Record<string, any> {
  if (maxDepth <= 0) return {};
  
  const flattened: Record<string, any> = {};
  
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    
    const value = obj[key];
    const newKey = prefix ? `${prefix}_${key}` : key;
    
    if (value === null || value === undefined) {
      flattened[newKey] = "";
    } else if (value instanceof Date) {
      flattened[newKey] = value.toISOString().split("T")[0];
    } else if (value && typeof value.toDate === "function") {
      // Firebase Timestamp
      flattened[newKey] = value.toDate().toISOString().split("T")[0];
    } else if (Array.isArray(value)) {
      // Handle arrays - join with semicolon or index
      if (value.length === 0) {
        flattened[newKey] = "";
      } else if (value.every(v => typeof v === "string" || typeof v === "number")) {
        flattened[newKey] = value.join("; ");
      } else {
        value.forEach((item, idx) => {
          Object.assign(flattened, flattenObject(item, `${newKey}_${idx}`, maxDepth - 1));
        });
      }
    } else if (typeof value === "object") {
      // Recursively flatten nested objects
      Object.assign(flattened, flattenObject(value, newKey, maxDepth - 1));
    } else {
      flattened[newKey] = value;
    }
  }
  
  return flattened;
}

/**
 * Formats a value for CSV export (handles quotes and commas)
 */
function formatCSVValue(value: any): string {
  if (value === null || value === undefined) return "";
  
  const stringValue = String(value);
  
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Converts data array to CSV string
 */
export function convertToCSV(data: Record<string, any>[]): string {
  if (!data || data.length === 0) return "";
  
  // Get all unique headers from all objects
  const headers = Array.from(
    new Set(data.flatMap(obj => Object.keys(obj)))
  ).sort();
  
  // Create header row
  const headerRow = headers.map(formatCSVValue).join(",");
  
  // Create data rows
  const dataRows = data.map(row =>
    headers.map(header => formatCSVValue(row[header] ?? "")).join(",")
  );
  
  // Combine with newlines
  return [headerRow, ...dataRows].join("\n");
}

/**
 * Loads all assessment data from all domains
 */
export async function loadAllAssessmentData(patientId?: string): Promise<any[]> {
  const allData: any[] = [];
  
  try {
    // Load Physiotherapy assessments
    const physioQuery = query(
      collection(db, "physioAssessments"),
      orderBy("updatedAt", "desc")
    );
    const physioSnapshot = await getDocs(physioQuery);
    
    physioSnapshot.forEach((doc) => {
      const data = doc.data();
      if (!patientId || doc.id === patientId) {
        allData.push({
          _entryId: doc.id,
          _domain: "Physiotherapy",
          _collection: "physioAssessments",
          ...data,
        });
      }
    });
    
    // Load Biomechanics assessments
    const biomechQuery = query(
      collection(db, "biomechanicsAssessments"),
      orderBy("updatedAt", "desc")
    );
    const biomechSnapshot = await getDocs(biomechQuery);
    
    biomechSnapshot.forEach((doc) => {
      const data = doc.data();
      if (!patientId || doc.id === patientId) {
        allData.push({
          _entryId: doc.id,
          _domain: "Biomechanics",
          _collection: "biomechanicsAssessments",
          ...data,
        });
      }
    });
    
    // Future: Add other domains here (Physiology, Nutrition, Psychology)
    
  } catch (error) {
    console.error("Error loading assessment data:", error);
    throw error;
  }
  
  return allData;
}

/**
 * Groups data by patient/entry for better organization
 */
export function groupDataByPatient(data: any[]): Record<string, any> {
  const grouped: Record<string, any> = {};
  
  data.forEach((item) => {
    const entryId = item._entryId;
    
    if (!grouped[entryId]) {
      grouped[entryId] = {
        entryId,
        domains: {},
      };
    }
    
    grouped[entryId].domains[item._domain] = item;
  });
  
  return grouped;
}

/**
 * Creates a well-formatted export data structure
 */
export function formatExportData(
  data: any[],
  groupByPatient: boolean = false
): Record<string, any>[] | Record<string, any> {
  if (groupByPatient) {
    return groupDataByPatient(data);
  }
  
  // Flatten all data for simple export
  return data.map(item => flattenObject(item));
}

/**
 * Downloads data as CSV file
 */
export function downloadCSV(csvString: string, filename: string = "export") {
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Creates Excel-compatible CSV (UTF-8 BOM for Excel)
 */
export function downloadExcelCSV(csvString: string, filename: string = "export") {
  // Add UTF-8 BOM for Excel compatibility
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================
// PHYSIOTHERAPY EXPORT FUNCTION - Clean & Structured
// ============================================================

/**
 * Formats date to DD/MM/YYYY
 */
function formatDateToDDMMYYYY(value: any): string {
  if (!value) return '-';
  
  let date: Date | null = null;
  
  // Handle Firebase Timestamp
  if (value && typeof value.toDate === 'function') {
    date = value.toDate();
  }
  // Handle Date object
  else if (value instanceof Date) {
    date = value;
  }
  // Handle ISO string
  else if (typeof value === 'string') {
    date = new Date(value);
    if (isNaN(date.getTime())) return '-';
  }
  
  if (!date || isNaN(date.getTime())) return '-';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Sanitizes value - replaces null/undefined with '-'
 */
function sanitizeValue(value: any): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  
  // Handle dates
  if (value instanceof Date || (value && typeof value.toDate === 'function')) {
    return formatDateToDDMMYYYY(value);
  }
  
  // Convert to string and trim
  const str = String(value).trim();
  return str === '' ? '-' : str;
}

/**
 * Header mapping: Technical keys to Human-readable labels
 */
const HEADER_MAPPING: Record<string, string> = {
  // Registration Details
  'firstName': 'First Name',
  'lastName': 'Last Name',
  'fullName': 'Full Name',
  'age': 'Age',
  'rank': 'Rank',
  'serviceNumber': 'Service Number',
  'serviceBranch': 'Service Branch',
  'bloodGroup': 'Blood Group',
  'dob': 'Date of Birth',
  'gender': 'Gender',
  
  // Injury History
  'chiefComplaints': 'Chief Complaints',
  'history': 'History',
  'painSeverity': 'Pain Severity',
  'diagnosis': 'Diagnosis',
  'modeOfTreatment': 'Mode of Treatment',
  
  // ROM - Cervical
  'cervFlex': 'Cervical Flexion',
  'cervExt': 'Cervical Extension',
  'cervLatFlexL': 'Cervical Lateral Flexion Left',
  'cervLatFlexR': 'Cervical Lateral Flexion Right',
  'cervRotL': 'Cervical Rotation Left',
  'cervRotR': 'Cervical Rotation Right',
  
  // ROM - Thoracic
  'thorFlex': 'Thoracic Flexion',
  'thorExt': 'Thoracic Extension',
  'thorLatFlexL': 'Thoracic Lateral Flexion Left',
  'thorLatFlexR': 'Thoracic Lateral Flexion Right',
  'thorRotL': 'Thoracic Rotation Left',
  'thorRotR': 'Thoracic Rotation Right',
  
  // ROM - Shoulder
  'shFlexL': 'Shoulder Flexion Left',
  'shFlexR': 'Shoulder Flexion Right',
  'shAbdL': 'Shoulder Abduction Left',
  'shAbdR': 'Shoulder Abduction Right',
  'shERL': 'Shoulder External Rotation Left',
  'shERR': 'Shoulder External Rotation Right',
  'shIRL': 'Shoulder Internal Rotation Left',
  'shIRR': 'Shoulder Internal Rotation Right',
  
  // ROM - Hip
  'hipFlexL': 'Hip Flexion Left',
  'hipFlexR': 'Hip Flexion Right',
  'hipAbdL': 'Hip Abduction Left',
  'hipAbdR': 'Hip Abduction Right',
  'hipERL': 'Hip External Rotation Left',
  'hipERR': 'Hip External Rotation Right',
  'hipIRL': 'Hip Internal Rotation Left',
  'hipIRR': 'Hip Internal Rotation Right',
  
  // ROM - Knee
  'kneeFlexL': 'Knee Flexion Left',
  'kneeFlexR': 'Knee Flexion Right',
  'kneeExtL': 'Knee Extension Left',
  'kneeExtR': 'Knee Extension Right',
  
  // ROM - Ankle
  'ankleDFL': 'Ankle Dorsiflexion Left',
  'ankleDFR': 'Ankle Dorsiflexion Right',
  'anklePFL': 'Ankle Plantarflexion Left',
  'anklePFR': 'Ankle Plantarflexion Right',
  
  // ROM - Other
  'sitAndReach': 'Sit and Reach',
  'poplitealAngle': 'Popliteal Angle',
  'thomasTest': 'Thomas Test',
  
  // Static Posture - Anterior
  'headTilt': 'Head Tilt',
  'shoulderAlignment': 'Shoulder Alignment',
  'trunkAlignment': 'Trunk Alignment',
  'pelvicAlignment': 'Pelvic Alignment',
  'kneeAlignmentAnterior': 'Knee Alignment (Anterior)',
  
  // Static Posture - Lateral
  'headAlignmentLat': 'Head Alignment (Lateral)',
  'shoulderAlignmentLat': 'Shoulder Alignment (Lateral)',
  'spinalCurves': 'Spinal Curves',
  'pelvicTilt': 'Pelvic Tilt',
  'kneeAlignmentLat': 'Knee Alignment (Lateral)',
  
  // FMS
  'deepSquat': 'Deep Squat',
  'hurdleL': 'Hurdle Left',
  'hurdleR': 'Hurdle Right',
  'lungeL': 'Lunge Left',
  'lungeR': 'Lunge Right',
  'shoulderMobL': 'Shoulder Mobility Left',
  'shoulderMobR': 'Shoulder Mobility Right',
  'aslrL': 'Active Straight Leg Raise Left',
  'aslrR': 'Active Straight Leg Raise Right',
  'trunkStability': 'Trunk Stability',
  'rotaryL': 'Rotary Stability Left',
  'rotaryR': 'Rotary Stability Right',
  
  // Strength & Stability
  'plankTime': 'Plank Time (seconds)',
  'sidePlankL': 'Side Plank Left (seconds)',
  'sidePlankR': 'Side Plank Right (seconds)',
  'staticBalance': 'Static Balance',
  'dynamicBalance': 'Dynamic Balance',
};

/**
 * Gets human-readable header name
 */
function getHeaderName(key: string): string {
  return HEADER_MAPPING[key] || key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Extracts and structures physiotherapy data from raw database entry
 */
function extractPhysiotherapyData(rawData: any): Record<string, any> {
  const extracted: Record<string, any> = {};
  
  // Extract Registration Details
  const regDetails = rawData.registrationDetails || {};
  extracted['firstName'] = sanitizeValue(regDetails.firstName);
  extracted['lastName'] = sanitizeValue(regDetails.lastName);
  extracted['fullName'] = sanitizeValue(regDetails.fullName);
  extracted['age'] = sanitizeValue(regDetails.age);
  extracted['rank'] = sanitizeValue(regDetails.rank);
  extracted['serviceNumber'] = sanitizeValue(regDetails.serviceNumber);
  extracted['serviceBranch'] = sanitizeValue(regDetails.serviceBranch);
  extracted['bloodGroup'] = sanitizeValue(regDetails.bloodGroup);
  extracted['dob'] = formatDateToDDMMYYYY(regDetails.dob);
  
  // Extract Injury History
  const injuryHistory = rawData.injuryHistory || {};
  extracted['chiefComplaints'] = sanitizeValue(injuryHistory.chiefComplaints);
  extracted['history'] = sanitizeValue(injuryHistory.history);
  extracted['painSeverity'] = sanitizeValue(injuryHistory.painSeverity);
  extracted['diagnosis'] = sanitizeValue(injuryHistory.diagnosis);
  extracted['modeOfTreatment'] = sanitizeValue(injuryHistory.modeOfTreatment);
  
  // Extract ROM (Range of Motion)
  const rom = rawData.rom || {};
  extracted['cervFlex'] = sanitizeValue(rom.cervFlex);
  extracted['cervExt'] = sanitizeValue(rom.cervExt);
  extracted['cervLatFlexL'] = sanitizeValue(rom.cervLatFlexL);
  extracted['cervLatFlexR'] = sanitizeValue(rom.cervLatFlexR);
  extracted['cervRotL'] = sanitizeValue(rom.cervRotL);
  extracted['cervRotR'] = sanitizeValue(rom.cervRotR);
  extracted['thorFlex'] = sanitizeValue(rom.thorFlex);
  extracted['thorExt'] = sanitizeValue(rom.thorExt);
  extracted['thorLatFlexL'] = sanitizeValue(rom.thorLatFlexL);
  extracted['thorLatFlexR'] = sanitizeValue(rom.thorLatFlexR);
  extracted['thorRotL'] = sanitizeValue(rom.thorRotL);
  extracted['thorRotR'] = sanitizeValue(rom.thorRotR);
  extracted['shFlexL'] = sanitizeValue(rom.shFlexL);
  extracted['shFlexR'] = sanitizeValue(rom.shFlexR);
  extracted['shAbdL'] = sanitizeValue(rom.shAbdL);
  extracted['shAbdR'] = sanitizeValue(rom.shAbdR);
  extracted['shERL'] = sanitizeValue(rom.shERL);
  extracted['shERR'] = sanitizeValue(rom.shERR);
  extracted['shIRL'] = sanitizeValue(rom.shIRL);
  extracted['shIRR'] = sanitizeValue(rom.shIRR);
  extracted['hipFlexL'] = sanitizeValue(rom.hipFlexL);
  extracted['hipFlexR'] = sanitizeValue(rom.hipFlexR);
  extracted['hipAbdL'] = sanitizeValue(rom.hipAbdL);
  extracted['hipAbdR'] = sanitizeValue(rom.hipAbdR);
  extracted['hipERL'] = sanitizeValue(rom.hipERL);
  extracted['hipERR'] = sanitizeValue(rom.hipERR);
  extracted['hipIRL'] = sanitizeValue(rom.hipIRL);
  extracted['hipIRR'] = sanitizeValue(rom.hipIRR);
  extracted['kneeFlexL'] = sanitizeValue(rom.kneeFlexL);
  extracted['kneeFlexR'] = sanitizeValue(rom.kneeFlexR);
  extracted['kneeExtL'] = sanitizeValue(rom.kneeExtL);
  extracted['kneeExtR'] = sanitizeValue(rom.kneeExtR);
  extracted['ankleDFL'] = sanitizeValue(rom.ankleDFL);
  extracted['ankleDFR'] = sanitizeValue(rom.ankleDFR);
  extracted['anklePFL'] = sanitizeValue(rom.anklePFL);
  extracted['anklePFR'] = sanitizeValue(rom.anklePFR);
  extracted['sitAndReach'] = sanitizeValue(rom.sitAndReach);
  extracted['poplitealAngle'] = sanitizeValue(rom.poplitealAngle);
  extracted['thomasTest'] = sanitizeValue(rom.thomasTest);
  
  // Extract Static Posture
  const staticPosture = rawData.staticPosture || {};
  extracted['headTilt'] = sanitizeValue(staticPosture.headTilt);
  extracted['shoulderAlignment'] = sanitizeValue(staticPosture.shoulderAlignment);
  extracted['trunkAlignment'] = sanitizeValue(staticPosture.trunkAlignment);
  extracted['pelvicAlignment'] = sanitizeValue(staticPosture.pelvicAlignment);
  extracted['kneeAlignmentAnterior'] = sanitizeValue(staticPosture.kneeAlignmentAnterior);
  extracted['headAlignmentLat'] = sanitizeValue(staticPosture.headAlignmentLat);
  extracted['shoulderAlignmentLat'] = sanitizeValue(staticPosture.shoulderAlignmentLat);
  extracted['spinalCurves'] = sanitizeValue(staticPosture.spinalCurves);
  extracted['pelvicTilt'] = sanitizeValue(staticPosture.pelvicTilt);
  extracted['kneeAlignmentLat'] = sanitizeValue(staticPosture.kneeAlignmentLat);
  
  // Extract FMS
  const fms = rawData.fms || {};
  extracted['deepSquat'] = sanitizeValue(fms.deepSquat);
  extracted['hurdleL'] = sanitizeValue(fms.hurdleL);
  extracted['hurdleR'] = sanitizeValue(fms.hurdleR);
  extracted['lungeL'] = sanitizeValue(fms.lungeL);
  extracted['lungeR'] = sanitizeValue(fms.lungeR);
  extracted['shoulderMobL'] = sanitizeValue(fms.shoulderMobL);
  extracted['shoulderMobR'] = sanitizeValue(fms.shoulderMobR);
  extracted['aslrL'] = sanitizeValue(fms.aslrL);
  extracted['aslrR'] = sanitizeValue(fms.aslrR);
  extracted['trunkStability'] = sanitizeValue(fms.trunkStability);
  extracted['rotaryL'] = sanitizeValue(fms.rotaryL);
  extracted['rotaryR'] = sanitizeValue(fms.rotaryR);
  
  // Extract Strength & Stability
  const strengthStability = rawData.strengthStability || {};
  extracted['plankTime'] = sanitizeValue(strengthStability.plankTime);
  extracted['sidePlankL'] = sanitizeValue(strengthStability.sidePlankL);
  extracted['sidePlankR'] = sanitizeValue(strengthStability.sidePlankR);
  extracted['staticBalance'] = sanitizeValue(strengthStability.staticBalance);
  extracted['dynamicBalance'] = sanitizeValue(strengthStability.dynamicBalance);
  
  return extracted;
}

/**
 * Main function to export Physiotherapy data as clean, structured CSV
 */
export function exportPhysiotherapyToCSV(
  data: any[],
  filename: string = "physiotherapy_report"
): string {
  if (!data || data.length === 0) {
    return "";
  }
  
  // Extract and structure data from each entry
  const structuredData = data.map(entry => {
    // Only process Physiotherapy domain entries
    if (entry._domain === 'Physiotherapy' || !entry._domain) {
      return extractPhysiotherapyData(entry);
    }
    
    return null;
  }).filter(Boolean) as Record<string, any>[];
  
  if (structuredData.length === 0) {
    return "";
  }
  
  // Define column order (grouped by domain)
  const columnOrder = [
    // Registration Details
    'fullName', 'firstName', 'lastName', 'age', 'rank', 'serviceNumber', 
    'serviceBranch', 'bloodGroup', 'dob',
    
    // Injury History
    'chiefComplaints', 'history', 'painSeverity', 'diagnosis', 'modeOfTreatment',
    
    // ROM - Cervical
    'cervFlex', 'cervExt', 'cervLatFlexL', 'cervLatFlexR', 'cervRotL', 'cervRotR',
    
    // ROM - Thoracic
    'thorFlex', 'thorExt', 'thorLatFlexL', 'thorLatFlexR', 'thorRotL', 'thorRotR',
    
    // ROM - Shoulder
    'shFlexL', 'shFlexR', 'shAbdL', 'shAbdR', 'shERL', 'shERR', 'shIRL', 'shIRR',
    
    // ROM - Hip
    'hipFlexL', 'hipFlexR', 'hipAbdL', 'hipAbdR', 'hipERL', 'hipERR', 'hipIRL', 'hipIRR',
    
    // ROM - Knee
    'kneeFlexL', 'kneeFlexR', 'kneeExtL', 'kneeExtR',
    
    // ROM - Ankle
    'ankleDFL', 'ankleDFR', 'anklePFL', 'anklePFR',
    
    // ROM - Other
    'sitAndReach', 'poplitealAngle', 'thomasTest',
    
    // Static Posture
    'headTilt', 'shoulderAlignment', 'trunkAlignment', 'pelvicAlignment', 
    'kneeAlignmentAnterior', 'headAlignmentLat', 'shoulderAlignmentLat',
    'spinalCurves', 'pelvicTilt', 'kneeAlignmentLat',
    
    // FMS
    'deepSquat', 'hurdleL', 'hurdleR', 'lungeL', 'lungeR',
    'shoulderMobL', 'shoulderMobR', 'aslrL', 'aslrR',
    'trunkStability', 'rotaryL', 'rotaryR',
    
    // Strength & Stability
    'plankTime', 'sidePlankL', 'sidePlankR', 'staticBalance', 'dynamicBalance',
  ];
  
  // Get all keys from data
  const allKeys = new Set<string>();
  structuredData.forEach(row => {
    Object.keys(row).forEach(key => allKeys.add(key));
  });
  
  // Build headers with human-readable names
  const headers = columnOrder.filter(key => allKeys.has(key));
  
  // Create header row with human-readable names
  const headerRow = headers.map(key => formatCSVValue(getHeaderName(key))).join(',');
  
  // Create data rows
  const dataRows = structuredData.map(row =>
    headers.map(header => formatCSVValue(row[header] || '-')).join(',')
  );
  
  // Combine
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Downloads Physiotherapy data as clean CSV
 */
export function downloadPhysiotherapyReport(
  csvString: string,
  filename: string = "physiotherapy_report"
) {
  const BOM = "\uFEFF"; // UTF-8 BOM for Excel
  const blob = new Blob([BOM + csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

