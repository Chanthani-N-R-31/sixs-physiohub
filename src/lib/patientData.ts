// src/lib/patientData.ts
// Shared patient data source for search functionality

export interface Patient {
  id: string;
  name: string;
  age: number;
  date: string;
  status: string;
}

// Combined patient data from all sources
export const getAllPatients = (): Patient[] => {
  // Data from Overview Page
  const overviewPatients: Patient[] = [
    { id: "P-001", name: "Asha K", age: 28, date: "2025-11-18", status: "Completed" },
    { id: "P-002", name: "Rohit P", age: 31, date: "2025-11-17", status: "Pending" },
    { id: "P-003", name: "Meera S", age: 24, date: "2025-11-15", status: "Incomplete" },
  ];

  // Data from Entries Page
  const entriesPatients: Patient[] = [
    { id: "P-001", name: "Asha K", age: 28, date: "2025-11-18", status: "Completed" },
    { id: "P-002", name: "Rohit P", age: 31, date: "2025-11-17", status: "Pending" },
    { id: "P-003", name: "Meera S", age: 24, date: "2025-11-15", status: "Incomplete" },
    { id: "P-004", name: "Rahul V", age: 27, date: "2025-11-10", status: "Completed" },
  ];

  // Combine and remove duplicates
  const allPatients = [...overviewPatients, ...entriesPatients];
  const uniquePatients = Array.from(
    new Map(allPatients.map((p) => [p.id, p])).values()
  );

  return uniquePatients;
};

