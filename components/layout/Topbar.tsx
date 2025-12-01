// src/components/layout/Topbar.tsx
"use client";

import { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { useRouter, usePathname } from "next/navigation";

interface Patient {
  id: string;
  fullId?: string; // Full document ID for navigation
  name: string;
  age: number;
  date: string;
  status: string;
  fullData?: any; // Full document data
}

export default function Topbar() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "physioAssessments"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      
      const loadedPatients: Patient[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const regDetails = data.registrationDetails || {};
        
        // Get full name - try multiple fields
        let fullName = regDetails.fullName || "";
        if (!fullName) {
          const parts = [
            regDetails.firstName,
            regDetails.initials,
            regDetails.lastName
          ].filter(Boolean);
          fullName = parts.join(" ").trim() || "Unknown Patient";
        }
        
        const age = regDetails.age || regDetails.yearsInService || 0;
        
        // Format date
        let date = regDetails.dateOfAssessment || "";
        if (!date && data.createdAt) {
          const timestamp = data.createdAt.toDate ? data.createdAt.toDate() : null;
          if (timestamp) {
            date = timestamp.toLocaleDateString();
          }
        }
        if (!date) date = "N/A";
        
        const status = data.status === "completed" ? "Completed" : data.status === "in_progress" ? "In Progress" : "Incomplete";
        
        loadedPatients.push({
          id: `P-${docSnapshot.id.slice(0, 6)}`,
          fullId: docSnapshot.id, // Store full ID for navigation
          name: fullName,
          age: typeof age === 'string' ? parseInt(age) || 0 : age,
          date: date,
          status: status,
          fullData: { id: docSnapshot.id, ...data }, // Store full data
        });
      });
      
      setPatients(loadedPatients);
    } catch (error) {
      console.error("Error loading patients for search:", error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    // Navigate based on current route
    if (pathname?.startsWith("/admin")) {
      // If in admin, navigate to admin patients page
      router.push("/admin/patients");
    } else {
      // If in dashboard, navigate to dashboard
      router.push("/dashboard");
    }
    // You could also scroll to the patient or highlight it
    console.log("Selected patient:", patient);
  };

  return (
    <div className="sticky top-0 z-20 bg-gray-800 border-b border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
          {/* Search */}
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <SearchBar patients={patients} onPatientSelect={handlePatientSelect} />
          </div>
        </div>
      </div>
    </div>
  );
}
