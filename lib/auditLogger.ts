/**
 * Audit Logger Module
 * 
 * Logs system actions to Firestore for tracking and compliance.
 * All actions are recorded with user information, timestamp, and details.
 */

import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export type AuditAction = 
  | "CREATED" 
  | "UPDATED" 
  | "DELETED" 
  | "RESTORED" 
  | "CORRECTED";

/**
 * Logs an activity/action to the audit log
 * 
 * @param userId - The unique identifier of the user performing the action
 * @param userName - The display name or email of the user
 * @param action - The type of action being logged (CREATED, UPDATED, DELETED, etc.)
 * @param detail - A detailed description of what was done
 * @returns Promise<void> - Resolves when the log entry is successfully created
 * @throws Error if logging fails
 */
export async function logActivity(
  userId: string,
  userName: string,
  action: AuditAction | string,
  detail: string
): Promise<void> {
  try {
    await addDoc(collection(db, "auditLogs"), {
      userId,
      userName,
      action: action.toUpperCase(),
      detail, // For ActivityFeed compatibility
      details: detail, // Also store as 'details' for ActivityFeed compatibility (it checks both)
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw error to prevent breaking the main action flow
    // But log it for debugging purposes
    throw new Error(`Failed to log activity: ${error instanceof Error ? error.message : String(error)}`);
  }
}

