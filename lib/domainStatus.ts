// Utility functions to determine domain completion status

export type DomainStatus = "not_started" | "in_progress" | "completed";

export interface DomainStatusMap {
  Physiotherapy: DomainStatus;
  Biomechanics: DomainStatus;
  Physiology: DomainStatus;
  Nutrition: DomainStatus;
  Psychology: DomainStatus;
}

/**
 * Determines if a section is considered completed
 * A section is completed if it has been saved at least once
 */
function isSectionSaved(sectionData: any): boolean {
  if (!sectionData) return false;
  
  // Check if section has any meaningful data (not just empty strings)
  const hasData = Object.values(sectionData).some((value) => {
    if (value === null || value === undefined || value === "") return false;
    if (typeof value === "object") {
      // Check nested objects
      return Object.values(value).some(v => 
        v !== null && v !== undefined && v !== ""
      );
    }
    return true;
  });
  
  return hasData;
}

/**
 * Determines if Physiotherapy domain is completed
 * Requires all major sections to be saved
 */
function checkPhysiotherapyStatus(data: any): DomainStatus {
  if (!data) return "not_started";
  
  const sections = [
    data.registrationDetails,
    data.injuryHistory,
    data.rom,
    data.strengthStability,
    data.fms,
    data.staticPosture,
  ];
  
  const savedSections = sections.filter(isSectionSaved);
  
  if (savedSections.length === 0) return "not_started";
  if (savedSections.length === sections.length) return "completed";
  return "in_progress";
}

/**
 * Determines if Biomechanics domain is completed
 * Requires all major sections to be saved
 */
function checkBiomechanicsStatus(data: any): DomainStatus {
  if (!data) return "not_started";
  
  const sections = [
    data.metadata,
    data.running,
    data.spatiotemporal,
    data.kinematic,
    data.impact,
    data.variability,
    data.loadCarriage,
    data.strength,
    data.powerTests,
  ];
  
  const savedSections = sections.filter(isSectionSaved);
  
  if (savedSections.length === 0) return "not_started";
  if (savedSections.length === sections.length) return "completed";
  return "in_progress";
}

/**
 * Checks status for other domains (Physiology, Nutrition, Psychology)
 * Currently returns not_started as these domains are not yet implemented
 */
function checkOtherDomainStatus(domain: string, data: any): DomainStatus {
  if (!data || !data[domain.toLowerCase()]) return "not_started";
  
  const domainData = data[domain.toLowerCase()];
  
  if (isSectionSaved(domainData)) {
    // Check if it's completed or in progress
    // For now, if there's data, consider it in progress
    return "in_progress";
  }
  
  return "not_started";
}

/**
 * Gets the status for all domains based on entry data
 */
export function getDomainStatuses(entryData: any): DomainStatusMap {
  if (!entryData) {
    return {
      Physiotherapy: "not_started",
      Biomechanics: "not_started",
      Physiology: "not_started",
      Nutrition: "not_started",
      Psychology: "not_started",
    };
  }
  
  return {
    Physiotherapy: checkPhysiotherapyStatus(entryData),
    Biomechanics: checkBiomechanicsStatus(entryData),
    Physiology: checkOtherDomainStatus("Physiology", entryData),
    Nutrition: checkOtherDomainStatus("Nutrition", entryData),
    Psychology: checkOtherDomainStatus("Psychology", entryData),
  };
}

/**
 * Gets a user-friendly status label
 */
export function getStatusLabel(status: DomainStatus): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In Progress";
    case "not_started":
      return "Not Started";
    default:
      return "Unknown";
  }
}

/**
 * Gets status badge styling
 */
export function getStatusBadgeClass(status: DomainStatus): string {
  switch (status) {
    case "completed":
      return "bg-green-50 text-green-700 border-green-200";
    case "in_progress":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "not_started":
      return "bg-gray-50 text-gray-600 border-gray-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

