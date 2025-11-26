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

