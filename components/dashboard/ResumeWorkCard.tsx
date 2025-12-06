"use client";

import { useState, useEffect } from "react";
import { ArrowRightIcon, ClockIcon } from "@heroicons/react/24/outline";
import { db, auth } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs, where, doc, getDoc } from "firebase/firestore";
import { getDomainStatuses } from "@/lib/domainStatus";

interface LastActiveEntry {
  id: string;
  fullId: string;
  name: string;
  lastUpdated: Date;
  status: string;
  domainStatuses: any;
  activeDomain?: string;
}

interface ResumeWorkCardProps {
  onResume?: (entryId: string, entryData: any, domain?: string) => void;
}

export default function ResumeWorkCard({ onResume }: ResumeWorkCardProps) {
  const [lastActive, setLastActive] = useState<LastActiveEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLastActiveEntry();
  }, []);

  const loadLastActiveEntry = async () => {
    try {
      setLoading(true);
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setLoading(false);
        return;
      }

      // Get the most recently updated entry by this user
      const q = query(
        collection(db, "physioAssessments"),
        where("createdBy", "==", userId),
        orderBy("updatedAt", "desc"),
        limit(1)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Fallback: get most recently updated entry regardless of user
        const fallbackQ = query(
          collection(db, "physioAssessments"),
          orderBy("updatedAt", "desc"),
          limit(1)
        );
        const fallbackSnapshot = await getDocs(fallbackQ);
        
        if (!fallbackSnapshot.empty) {
          const doc = fallbackSnapshot.docs[0];
          const data = doc.data();
          const regDetails = data.registrationDetails || {};
          
          let fullName = regDetails.fullName || "";
          if (!fullName) {
            const parts = [regDetails.firstName, regDetails.initials, regDetails.lastName].filter(Boolean);
            fullName = parts.join(" ").trim() || "Unknown Patient";
          }

          const domainStatuses = getDomainStatuses(data);
          const activeDomain = Object.entries(domainStatuses)
            .find(([_, status]) => status === "in_progress")?.[0] || 
            Object.entries(domainStatuses)
            .find(([_, status]) => status === "pending")?.[0];

          const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date();
          
          setLastActive({
            id: doc.id.slice(0, 6),
            fullId: doc.id,
            name: fullName,
            lastUpdated: updatedAt,
            status: data.status || "incomplete",
            domainStatuses,
            activeDomain,
          });
        }
      } else {
        const doc = snapshot.docs[0];
        const data = doc.data();
        const regDetails = data.registrationDetails || {};
        
        let fullName = regDetails.fullName || "";
        if (!fullName) {
          const parts = [regDetails.firstName, regDetails.initials, regDetails.lastName].filter(Boolean);
          fullName = parts.join(" ").trim() || "Unknown Patient";
        }

        const domainStatuses = getDomainStatuses(data);
        const activeDomain = Object.entries(domainStatuses)
          .find(([_, status]) => status === "in_progress")?.[0] || 
          Object.entries(domainStatuses)
          .find(([_, status]) => status === "pending")?.[0];

        const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date();
        
        setLastActive({
          id: doc.id.slice(0, 6),
          fullId: doc.id,
          name: fullName,
          lastUpdated: updatedAt,
          status: data.status || "incomplete",
          domainStatuses,
          activeDomain,
        });
      }
    } catch (error) {
      console.error("Error loading last active entry:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!lastActive) return;
    
    try {
      // Fetch the full entry data
      const entryRef = doc(db, "physioAssessments", lastActive.fullId);
      const entrySnap = await getDoc(entryRef);
      
      if (entrySnap.exists()) {
        const entryData = { id: entrySnap.id, ...entrySnap.data() };
        
        // Call the onResume callback if provided
        if (onResume) {
          onResume(lastActive.fullId, entryData, lastActive.activeDomain);
        } else {
          // Fallback: log to console
          console.log("Resume work:", lastActive.fullId, entryData);
        }
      }
    } catch (error) {
      console.error("Error resuming work:", error);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/30">
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-white/20 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!lastActive) {
    return null;
  }

  return (
    <div 
      onClick={(e) => handleResume(e)}
      onMouseDown={(e) => e.stopPropagation()}
      className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/30 cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02]"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleResume();
        }
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <ClockIcon className="w-5 h-5 text-black" />
            <span className="text-sm font-bold text-black">Resume Work</span>
          </div>
          <h3 className="text-xl font-bold text-black mb-1">
            {lastActive.name}
          </h3>
          <p className="text-black font-bold text-sm mb-2">
            {lastActive.activeDomain ? `Continue ${lastActive.activeDomain}` : "Last updated"} • {formatTimeAgo(lastActive.lastUpdated)}
          </p>
          <div className="flex items-center gap-2 text-black font-bold text-sm">
            <span>Continue</span>
            <ArrowRightIcon className="w-4 h-4" />
          </div>
        </div>
        <div className="ml-4">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
            <ArrowRightIcon className="w-8 h-8 text-black" />
          </div>
        </div>
      </div>
    </div>
  );
}

