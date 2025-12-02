// src/lib/auditLogger.ts
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function logActivity(
  userId: string, 
  userName: string, 
  action: 'CREATED' | 'UPDATED' | 'DELETED' | 'RESTORED' | 'CORRECTED', 
  details: string
): Promise<void> {
  try {
    await addDoc(collection(db, "auditLogs"), {
      userId,
      userName,
      action,
      details,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
