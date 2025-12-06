// src/lib/excelExport.ts
/**
 * Excel Export System - Clean, Human-Readable, Well-Structured
 * Creates multi-sheet Excel workbooks with domain separation
 */

import * as ExcelJS from "exceljs";

/**
 * Human-readable field labels mapping
 */
const FIELD_LABELS: Record<string, string> = {
  // Registration Details
  firstName: "First Name",
  initials: "Initials",
  lastName: "Last Name",
  fullName: "Full Name",
  serviceBranch: "Service Branch",
  serviceNumber: "Service Number",
  rank: "Rank",
  currentAppointment: "Current Appointment",
  enlistmentDate: "Enlistment Date",
  yearsInService: "Years in Service",
  yearsInSpecialForces: "Years in Special Forces",
  dob: "Date of Birth",
  age: "Age",
  gender: "Gender",
  bloodGroup: "Blood Group",
  dominantHand: "Dominant Hand",
  dominantLeg: "Dominant Leg",
  dominantEye: "Dominant Eye",
  contact: "Contact Number",
  email: "Email ID",
  trainingDepartment: "Training Department",
  dateOfAssessment: "Date of Assessment",
  
  // Service History
  totalYearsArmedForces: "Total Years in Armed Forces",
  totalYearsCombatRole: "Total Years in Combat Role",
  totalYearsSpecialForces: "Total Years in Special Forces",
  primaryRifle: "Primary Rifle",
  secondaryWeapon: "Secondary Weapon",
  rifleScore: "Rifle Score",
  pistolScore: "Pistol Score",
  
  // Medical
  medicalCategory: "Medical Category",
  painLocation: "Pain Location",
  painIntensity: "Pain Intensity",
  
  // Injury Details
  chiefComplaints: "Chief Complaints",
  history: "History",
  painSeverity: "Pain Severity",
  diagnosis: "Diagnosis",
  modeOfTreatment: "Mode of Treatment",
  
  // ROM
  cervFlex: "Cervical Flexion",
  cervExt: "Cervical Extension",
  hipFlexL: "Hip Flexion Left",
  hipFlexR: "Hip Flexion Right",
  
  // Strength
  plankTime: "Plank Time",
  sidePlankL: "Side Plank Left",
  sidePlankR: "Side Plank Right",
  
  // FMS
  deepSquat: "Deep Squat",
  hurdleL: "Hurdle Left",
  hurdleR: "Hurdle Right",
  
  // Biomechanics
  height: "Height",
  mass: "Mass",
  dominantSide: "Dominant Side",
  footStrikeHabit: "Foot Strike Habit",
};

/**
 * Formats a value for Excel export
 */
function formatValueForExcel(value: any): string | number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (typeof value === 'object') {
    // Handle Firebase Timestamps
    if (value && typeof value.toDate === 'function') {
      const date = value.toDate();
      return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    }
    // Handle Date objects
    if (value instanceof Date) {
      return value.toLocaleDateString('en-GB');
    }
    // For objects, stringify or handle arrays
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join('; ') : null;
    }
    // For nested objects, flatten or stringify
    const keys = Object.keys(value);
    if (keys.length === 0) return null;
    return JSON.stringify(value);
  }
  
  return String(value);
}

/**
 * Flattens nested objects with human-readable keys
 */
function flattenObject(obj: any, prefix: string = "", maxDepth: number = 5): Record<string, any> {
  if (maxDepth <= 0 || !obj || typeof obj !== 'object') {
    return {};
  }
  
  const flattened: Record<string, any> = {};
  
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    
    const value = obj[key];
    const fullKey = prefix ? `${prefix}_${key}` : key;
    
    // Skip internal metadata fields
    if (key.startsWith('_') || 
        key === 'createdAt' || key === 'updatedAt' || 
        key === 'createdBy' || key === 'updatedBy' || 
        key === 'status' || key === 'domainStatuses' || 
        key === 'id' || key === 'photograph' || key === 'photographPreview' ||
        key === 'serviceIdScan' || key === 'serviceIdScanPreview' ||
        key === 'medicalCategoryDoc' || key === 'medicalCategoryDocPreview' ||
        key === 'diagnosisImage' || key === 'diagnosisImagePreview') {
      continue;
    }
    
    if (value === null || value === undefined || value === '') {
      continue;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      // For arrays, join simple values or extract nested objects
      if (value.every(v => typeof v === 'string' || typeof v === 'number')) {
        flattened[fullKey] = value.join('; ');
      } else {
        value.forEach((item, idx) => {
          if (typeof item === 'object' && item !== null) {
            Object.assign(flattened, flattenObject(item, `${fullKey}_${idx}`, maxDepth - 1));
          } else {
            flattened[`${fullKey}_${idx}`] = item;
          }
        });
      }
    } else if (typeof value === 'object' && value !== null) {
      // Recursively extract nested objects
      Object.assign(flattened, flattenObject(value, fullKey, maxDepth - 1));
    } else {
      // Primitive value
      flattened[fullKey] = value;
    }
  }
  
  return flattened;
}

/**
 * Gets person ID - uses serviceNumber for consistency across domains
 */
function getPersonId(entry: any): string {
  const regDetails = entry.registrationDetails || {};
  
  // Priority 1: Use serviceNumber (most reliable for linking)
  if (regDetails.serviceNumber) {
    return regDetails.serviceNumber;
  }
  
  // Priority 2: Use entry ID from physioAssessments
  if (entry._entryId && entry._collection === 'physioAssessments') {
    return entry._entryId;
  }
  
  // Priority 3: Use entry ID
  if (entry._entryId) {
    return entry._entryId;
  }
  
  if (entry.id) {
    return entry.id;
  }
  
  // Fallback
  return `PERSON_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Converts field name to human-readable label with domain prefix
 */
function getFieldLabel(fieldName: string, domainPrefix: string): string {
  // Remove domain prefix if present
  const cleanName = fieldName.replace(new RegExp(`^${domainPrefix}_`), '');
  
  // Check if we have a label mapping
  if (FIELD_LABELS[cleanName]) {
    return `${domainPrefix.charAt(0).toUpperCase() + domainPrefix.slice(1)} - ${FIELD_LABELS[cleanName]}`;
  }
  
  // Convert snake_case to Title Case
  const titleCase = cleanName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  return `${domainPrefix.charAt(0).toUpperCase() + domainPrefix.slice(1)} - ${titleCase}`;
}

/**
 * Extracts data for Sheet 1: Registration Details
 */
function extractRegistrationDetails(entries: any[]): Array<Record<string, any>> {
  const sheetData: Array<Record<string, any>> = [];
  
  entries.forEach((entry) => {
    const regDetails = entry.registrationDetails || {};
    if (!regDetails || Object.keys(regDetails).length === 0) {
      return; // Skip if no registration data
    }
    
    const personId = getPersonId(entry);
    const rowData: Record<string, any> = { person_id: personId };
    
    // Extract registration fields
    const regFields = flattenObject(regDetails);
    
    // Add fields with reg_ prefix
    Object.entries(regFields).forEach(([key, value]) => {
      rowData[`reg_${key}`] = formatValueForExcel(value);
    });
    
    if (Object.keys(rowData).length > 1) {
      sheetData.push(rowData);
    }
  });
  
  return sheetData;
}

/**
 * Extracts data for Sheet 2: Physio Assessment Extended
 */
function extractPhysioExtended(entries: any[]): Array<Record<string, any>> {
  const sheetData: Array<Record<string, any>> = [];
  
  entries.forEach((entry) => {
    const personId = getPersonId(entry);
    const rowData: Record<string, any> = { person_id: personId };
    
    // Extract from physio forms (excluding registration)
    const physioData = {
      ...(entry.injuryHistory || {}),
      ...(entry.staticPosture || {}),
      ...(entry.rom || {}),
      ...(entry.strengthStability || {}),
      ...(entry.fms || {})
    };
    
    if (Object.keys(physioData).length === 0) {
      return; // Skip if no physio extended data
    }
    
    const physioFields = flattenObject(physioData);
    
    // Add fields with physio_ prefix
    Object.entries(physioFields).forEach(([key, value]) => {
      rowData[`physio_${key}`] = formatValueForExcel(value);
    });
    
    if (Object.keys(rowData).length > 1) {
      sheetData.push(rowData);
    }
  });
  
  return sheetData;
}

/**
 * Extracts data for Sheet 3: Biomechanics Assessment
 */
function extractBiomechanics(entries: any[]): Array<Record<string, any>> {
  const sheetData: Array<Record<string, any>> = [];
  
  entries.forEach((entry) => {
    // Only process biomechanics entries
    if (entry._domain !== 'Biomechanics' && entry._collection !== 'biomechanicsAssessments') {
      return;
    }
    
    const personId = getPersonId(entry);
    const rowData: Record<string, any> = { person_id: personId };
    
    // Extract biomechanics data
    const biomechData = {
      ...(entry.metadata || {}),
      ...(entry.running || {}),
      ...(entry.spatiotemporal || {}),
      ...(entry.kinematic || {}),
      ...(entry.impact || {}),
      ...(entry.variability || {}),
      ...(entry.loadCarriage || {}),
      ...(entry.strength || {}),
      ...(entry.powerTests || {})
    };
    
    if (Object.keys(biomechData).length === 0) {
      return; // Skip if no biomechanics data
    }
    
    const biomechFields = flattenObject(biomechData);
    
    // Add fields with biomech_ prefix
    Object.entries(biomechFields).forEach(([key, value]) => {
      rowData[`biomech_${key}`] = formatValueForExcel(value);
    });
    
    if (Object.keys(rowData).length > 1) {
      sheetData.push(rowData);
    }
  });
  
  return sheetData;
}

/**
 * Extracts data for Domain sheets (Physiology, Nutrition, Psychology)
 */
function extractDomainData(entries: any[], domainName: string, domainPrefix: string): Array<Record<string, any>> {
  const sheetData: Array<Record<string, any>> = [];
  
  entries.forEach((entry) => {
    // Check if entry has data for this domain
    const domainData = entry[domainName.toLowerCase()] || 
                      (entry._domain === domainName ? entry : null);
    
    if (!domainData || Object.keys(domainData).length === 0) {
      return;
    }
    
    const personId = getPersonId(entry);
    const rowData: Record<string, any> = { person_id: personId };
    
    const domainFields = flattenObject(domainData);
    
    // Add fields with domain prefix
    Object.entries(domainFields).forEach(([key, value]) => {
      rowData[`${domainPrefix}_${key}`] = formatValueForExcel(value);
    });
    
    if (Object.keys(rowData).length > 1) {
      sheetData.push(rowData);
    }
  });
  
  return sheetData;
}

/**
 * Creates Excel workbook with all sheets
 */
export async function exportToExcel(entries: any[]): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'PhysioHub';
  workbook.created = new Date();
  
  // Sheet 1: Registration Details
  const regData = extractRegistrationDetails(entries);
  if (regData.length > 0) {
    const regSheet = workbook.addWorksheet('Registration Details');
    addDataToSheet(regSheet, regData, 'reg');
  }
  
  // Sheet 2: Physio Assessment Extended
  const physioData = extractPhysioExtended(entries);
  if (physioData.length > 0) {
    const physioSheet = workbook.addWorksheet('Physio Assessment Extended');
    addDataToSheet(physioSheet, physioData, 'physio');
  }
  
  // Sheet 3: Biomechanics Assessment
  const biomechData = extractBiomechanics(entries);
  if (biomechData.length > 0) {
    const biomechSheet = workbook.addWorksheet('Biomechanics Assessment');
    addDataToSheet(biomechSheet, biomechData, 'biomech');
  }
  
  // Sheet 4: Domain 1 (Physiology)
  const domain1Data = extractDomainData(entries, 'Physiology', 'physiology');
  if (domain1Data.length > 0) {
    const domain1Sheet = workbook.addWorksheet('Domain 1');
    addDataToSheet(domain1Sheet, domain1Data, 'physiology');
  }
  
  // Sheet 5: Domain 2 (Nutrition)
  const domain2Data = extractDomainData(entries, 'Nutrition', 'nutrition');
  if (domain2Data.length > 0) {
    const domain2Sheet = workbook.addWorksheet('Domain 2');
    addDataToSheet(domain2Sheet, domain2Data, 'nutrition');
  }
  
  // Sheet 6: Domain 3 (Psychology)
  const domain3Data = extractDomainData(entries, 'Psychology', 'psychology');
  if (domain3Data.length > 0) {
    const domain3Sheet = workbook.addWorksheet('Domain 3');
    addDataToSheet(domain3Sheet, domain3Data, 'psychology');
  }
  
  return workbook;
}

/**
 * Adds data to a worksheet with proper formatting
 */
function addDataToSheet(
  worksheet: ExcelJS.Worksheet,
  data: Array<Record<string, any>>,
  domainPrefix: string
): void {
  if (data.length === 0) return;
  
  // Get all unique column names
  const allColumns = new Set<string>();
  data.forEach(row => {
    Object.keys(row).forEach(key => allColumns.add(key));
  });
  
  // Sort columns: person_id first, then alphabetically
  const columns = Array.from(allColumns).sort((a, b) => {
    if (a === 'person_id') return -1;
    if (b === 'person_id') return 1;
    return a.localeCompare(b);
  });
  
  // Set column headers with human-readable names
  worksheet.columns = columns.map(col => {
    let header = col;
    if (col === 'person_id') {
      header = 'Person ID';
    } else if (col.startsWith(domainPrefix + '_')) {
      header = getFieldLabel(col, domainPrefix);
    } else {
      // Convert to title case
      header = col
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    
    return {
      header,
      key: col,
      width: 20
    };
  });
  
  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1a4d4d' }
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  
  // Add data rows
  data.forEach(row => {
    const rowData: any[] = [];
    columns.forEach(col => {
      rowData.push(row[col] || null);
    });
    worksheet.addRow(rowData);
  });
  
  // Freeze header row
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  
  // Auto-fit columns (with max width)
  worksheet.columns.forEach(column => {
    if (!column || !column.eachCell) return;
    let maxLength = 0;
    column.eachCell({ includeEmpty: false }, (cell) => {
      const cellValue = cell.value ? String(cell.value) : '';
      if (cellValue.length > maxLength) {
        maxLength = cellValue.length;
      }
    });
    column.width = Math.min(Math.max(maxLength + 2, 15), 50);
  });
}

/**
 * Downloads Excel file
 */
export async function downloadExcelFile(
  workbook: ExcelJS.Workbook,
  filename: string = "physiohub_export"
): Promise<void> {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.xlsx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

