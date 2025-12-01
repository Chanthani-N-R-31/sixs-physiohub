"use client";

import { useState, useEffect } from "react";
import { TrashIcon, ArrowPathIcon, PencilSquareIcon, ArchiveBoxXMarkIcon } from "@heroicons/react/24/outline";
import GlassCard from "@/components/ui/GlassCard";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { logActivity } from "@/lib/auditLogger";

interface DeletedRecord {
  id: string;
  individualName: string;
  deletedBy: string;
  deletedOn: string;
  reason?: string;
  // Optional Firestore document ID of the original record (if available)
  docId?: string;
}

export default function DataGovernance() {
  const [activeTab, setActiveTab] = useState<"deleted" | "correction">("deleted");
  const [deletedRecords, setDeletedRecords] = useState<DeletedRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "deleted") {
      loadDeletedRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadDeletedRecords = async () => {
    try {
      setLoading(true);

      // Fetch all archived (soft-deleted) records so we can hide
      // audit entries that no longer have an archived copy.
      const archivedSnapshot = await getDocs(collection(db, "deletedPhysioAssessments"));
      const archivedIds = new Set<string>();
      const archivedNames = new Set<string>();

      archivedSnapshot.forEach((docSnap) => {
        archivedIds.add(docSnap.id);
        const data = docSnap.data() as any;
        const fullName = data?.registrationDetails?.fullName;
        if (fullName) {
          archivedNames.add(fullName);
        }
      });

      // Filter by action in Firestore; sort by timestamp on the client to avoid needing a composite index
      const q = query(
        collection(db, "auditLogs"),
        where("action", "==", "DELETED")
      );

      const snapshot = await getDocs(q);
      const results: DeletedRecord[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const detail: string = data.details || data.detail || "";

        // Try to extract name from the detail string: "Deleted individual P-XXXX (Full Name)"
        let individualName = "Unknown Individual";
        const match = detail.match(/Deleted individual\s+.+\s+\((.+)\)/i);
        if (match && match[1]) {
          individualName = match[1];
        } else if (detail) {
          individualName = detail;
        }

        const deletedBy = data.userName || data.userId || "Unknown";
        const ts = data.timestamp?.toDate ? data.timestamp.toDate() : null;
        const deletedOn = ts ? ts.toLocaleString() : "Unknown";

        // Try to extract original Firestore document ID if it was logged
        // Example detail: "Deleted individual P-XXXX (Full Name) [docId=abcdef]"
        let originalDocId: string | undefined;
        const docIdMatch = detail.match(/\[docId=([^\]]+)\]/i);
        if (docIdMatch && docIdMatch[1]) {
          originalDocId = docIdMatch[1];
        }

        // Only show this deleted record in the UI if there is still
        // a corresponding archived document we can restore from.
        const hasArchive =
          (originalDocId && archivedIds.has(originalDocId)) ||
          archivedNames.has(individualName);
        if (!hasArchive) {
          return;
        }

        results.push({
          id: docSnap.id,
          individualName,
          deletedBy,
          deletedOn,
          reason: "", // We are not capturing a free-text reason yet
          docId: originalDocId,
        });
      });

      // Sort newest first by timestamp
      results.sort((a, b) => {
        const ta = (a.deletedOn && new Date(a.deletedOn).getTime()) || 0;
        const tb = (b.deletedOn && new Date(b.deletedOn).getTime()) || 0;
        return tb - ta;
      });

      setDeletedRecords(results);
    } catch (err) {
      console.error("Error loading deleted records from audit logs:", err);
      setDeletedRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (record: DeletedRecord) => {
    if (
      !confirm(
        `Are you sure you want to restore the record for "${record.individualName}"? It will be moved back into the active assessments list.`
      )
    ) {
      return;
    }

    try {
      // 1) Determine which archived document to restore
      let targetDocId: string | undefined = record.docId;
      let archivedRef;

      if (targetDocId) {
        archivedRef = doc(db, "deletedPhysioAssessments", targetDocId);
      } else {
        // Fallback for older audit entries that don't have an explicit docId logged.
        // Try to find a matching archived record by the individual's name.
        const fallbackQuery = query(
          collection(db, "deletedPhysioAssessments"),
          where("registrationDetails.fullName", "==", record.individualName)
        );
        const fallbackSnap = await getDocs(fallbackQuery);

        if (fallbackSnap.empty) {
          alert(
            "Archived data for this record could not be found. It may have been deleted before the archive feature was enabled."
          );
          return;
        }

        const firstMatch = fallbackSnap.docs[0];
        targetDocId = firstMatch.id;
        archivedRef = firstMatch.ref;
      }

      // 2) Load the archived document from the deleted collection
      const archivedSnap = await getDoc(archivedRef);

      if (!archivedSnap.exists()) {
        alert("Archived data for this record could not be found. It may have already been permanently removed.");
        return;
      }

      const archivedData = archivedSnap.data();

      // 3) Restore it into the main collection with the same document ID
      const mainRef = doc(db, "physioAssessments", targetDocId!);
      await setDoc(mainRef, archivedData);

      // 4) Remove it from the deleted collection
      await deleteDoc(archivedRef);

      // 5) Log RESTORED activity
      const user = auth.currentUser;
      const userName = user?.email || user?.displayName || "Admin";
      const userId = user?.uid || "unknown";

      await logActivity(
        userId,
        userName,
        "RESTORED",
        `Restored individual ${record.individualName} [docId=${targetDocId}]`
      );

      // 6) Optimistically remove from local list
      setDeletedRecords((prev) => prev.filter((r) => r.id !== record.id));

      alert(`Record for "${record.individualName}" has been successfully restored.`);
    } catch (err) {
      console.error("Error restoring record:", err);
      alert("Failed to restore this record. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Data Governance</h2>
        <p className="text-white/70 mt-1 font-medium">Manage deletions, correct erroneously entered data, and restore records.</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-white/30">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("deleted")}
            className={`py-4 px-2 border-b-2 font-bold text-sm transition-colors flex items-center gap-2 ${
              activeTab === "deleted" 
              ? "border-red-500 text-white" 
              : "border-transparent text-white/70 hover:text-white"
            }`}
          >
            <ArchiveBoxXMarkIcon className="w-4 h-4" />
            Deleted Records Bin
          </button>
          <button
            onClick={() => setActiveTab("correction")}
            className={`py-4 px-2 border-b-2 font-bold text-sm transition-colors flex items-center gap-2 ${
              activeTab === "correction" 
              ? "border-green-500 text-white" 
              : "border-transparent text-white/70 hover:text-white"
            }`}
          >
            <PencilSquareIcon className="w-4 h-4" />
            Correction Console
          </button>
        </div>
      </div>

      {/* Content: Deleted Records */}
      {activeTab === "deleted" && (
        <div className="space-y-4">
          <GlassCard className="bg-red-500/20 border-red-500/50">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1.5 rounded-full text-red-300 shadow-sm backdrop-blur-sm">
                <TrashIcon className="w-5 h-5" />
              </div>
              <div className="text-white font-bold text-sm">
                <strong>Warning:</strong> "Force Delete" is a permanent action and cannot be undone. Use "Restore" to move records back to the active index.
              </div>
            </div>
          </GlassCard>
          
          <GlassCard className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white/10 backdrop-blur-sm border-b border-white/20">
                  <tr>
                    <th className="p-4 text-white/70 font-bold">Individual Name</th>
                    <th className="p-4 text-white/70 font-bold">Deleted By</th>
                    <th className="p-4 text-white/70 font-bold">Deleted On</th>
                    <th className="p-4 text-white/70 font-bold">Reason (Optional)</th>
                    <th className="p-4 text-white/70 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-white/70">
                        Loading deleted records...
                      </td>
                    </tr>
                  ) : deletedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-white/70">
                        No deleted records found in the audit logs.
                      </td>
                    </tr>
                  ) : (
                    deletedRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-white font-bold">{rec.individualName}</td>
                        <td className="p-4 text-white/80">{rec.deletedBy}</td>
                        <td className="p-4 text-white/70">{rec.deletedOn}</td>
                        <td className="p-4 text-white/60 italic">
                          {rec.reason && rec.reason.trim() !== "" ? rec.reason : "—"}
                        </td>
                        <td className="p-4 flex gap-2">
                          <button
                            className="flex items-center gap-1 text-white bg-green-500/80 hover:bg-green-500/90 border border-green-500/50 backdrop-blur-sm px-3 py-1.5 rounded transition-colors text-xs font-bold"
                            onClick={() => handleRestore(rec)}
                          >
                            <ArrowPathIcon className="w-3.5 h-3.5" /> Restore
                          </button>
                          <button
                            className="flex items-center gap-1 text-white bg-red-600/80 hover:bg-red-600/90 backdrop-blur-sm px-3 py-1.5 rounded transition-colors text-xs font-bold shadow-sm border border-red-600/50"
                            onClick={() => alert("Force delete logic is not implemented yet. This is a placeholder button.")}
                          >
                            <TrashIcon className="w-3.5 h-3.5" /> Force Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Content: Corrections */}
      {activeTab === "correction" && (
        <GlassCard className="text-center space-y-6">
          <div className="max-w-md mx-auto space-y-4">
            <h3 className="text-lg font-bold text-white">Edit Master Record</h3>
            <p className="text-sm text-white/70 font-medium">
              Admin privileges allow you to override specific data points in an individual's record without changing the audit trail of the original assessment.
            </p>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter Individual ID (e.g., P-1029)..." 
                className="flex-1 p-3 bg-white/20 backdrop-blur-md border border-white/40 rounded-lg text-white font-bold placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 shadow-lg"
              />
              <button className="bg-[#1a4d4d]/80 backdrop-blur-sm text-white px-6 py-3 rounded-lg hover:bg-[#1a4d4d]/90 font-bold transition shadow-lg border border-[#1a4d4d]/50">
                Fetch Record
              </button>
            </div>
          </div>
          
          <div className="border-2 border-dashed border-white/30 rounded-xl p-12 flex flex-col items-center justify-center text-white/60">
            <PencilSquareIcon className="w-16 h-16 mb-4 text-white/40" />
            <p className="font-bold">No record loaded.</p>
            <p className="text-sm">Enter an Individual ID above to enable admin-level corrections.</p>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
