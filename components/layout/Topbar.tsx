// src/components/layout/Topbar.tsx
"use client";

import { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { BellIcon } from "@heroicons/react/24/outline";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, where, limit } from "firebase/firestore";
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
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    loadPatients();
    loadNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showNotifications && !(event.target as Element).closest('.notification-container')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const loadNotifications = async () => {
    try {
      // Get recent critical actions (deletions, etc.) as notifications
      const q = query(
        collection(db, "auditLogs"),
        where("action", "in", ["DELETED", "RESTORED"]),
        orderBy("timestamp", "desc"),
        limit(5)
      );

      const snapshot = await getDocs(q);
      // Count notifications from last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      let count = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date();
        if (timestamp >= yesterday) {
          count++;
        }
      });
      
      setNotificationCount(count);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

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
        <div className="flex flex-col gap-4 py-4">
          {/* Top Row: Search and Notifications */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <SearchBar patients={patients} onPatientSelect={handlePatientSelect} />
            </div>
            
            {/* Notification Bell */}
            <div className="relative notification-container">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-white/70 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <BellIcon className="w-6 h-6" />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notificationCount === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <BellIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No new notifications</p>
                      </div>
                    ) : (
                      <div className="p-2">
                        <p className="text-sm text-gray-600 px-2 py-4">
                          {notificationCount} critical action{notificationCount !== 1 ? "s" : ""} in the last 24 hours.
                          <button
                            onClick={() => {
                              router.push("/admin/activity");
                              setShowNotifications(false);
                            }}
                            className="ml-2 text-teal-600 hover:text-teal-700 font-medium"
                          >
                            View Details →
                          </button>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Breadcrumbs Row */}
          <Breadcrumbs />
        </div>
      </div>
    </div>
  );
}
