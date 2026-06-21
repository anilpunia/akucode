import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, onValue, update } from 'firebase/database';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ──────────────────────────────────────────
// Family Pairing Functions
// ──────────────────────────────────────────

/**
 * Generate a random 4-digit family code
 */
export function generateFamilyCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/**
 * Create a new family with the parent as the first member
 */
export async function createFamily(code, parentName) {
  const familyRef = ref(db, `families/${code}`);
  await set(familyRef, {
    members: {
      parent: { name: parentName, joinedAt: Date.now() },
    },
    verification: {
      status: 'idle',
      requestedAt: null,
      respondedAt: null,
    },
    memories: [],
  });
}

/**
 * Check if a family code already exists
 */
export async function familyExists(code) {
  const familyRef = ref(db, `families/${code}`);
  const snapshot = await get(familyRef);
  return snapshot.exists();
}

/**
 * Join an existing family as the child/family member.
 * Returns a unique member key for this device.
 */
export async function joinFamily(code, childName) {
  const key = `child_${Date.now()}`;
  const memberRef = ref(db, `families/${code}/members/${key}`);
  await set(memberRef, { name: childName, joinedAt: Date.now(), available: true });
  return key;
}

/**
 * Get family member names
 */
export async function getFamilyMembers(code) {
  const membersRef = ref(db, `families/${code}/members`);
  const snapshot = await get(membersRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
}

// ──────────────────────────────────────────
// Verification Functions (the core loop)
// ──────────────────────────────────────────

/**
 * Parent sends a verification request
 */
export async function sendVerification(code) {
  const verificationRef = ref(db, `families/${code}/verification`);
  await set(verificationRef, {
    status: 'pending',
    requestedAt: Date.now(),
    respondedAt: null,
  });
}

/**
 * Family member responds to verification
 * @param {string} result - "scam" or "safe"
 */
export async function respondVerification(code, result) {
  const verificationRef = ref(db, `families/${code}/verification`);
  await update(verificationRef, {
    status: result,
    respondedAt: Date.now(),
  });
}

/**
 * Reset verification back to idle
 */
export async function resetVerification(code) {
  const verificationRef = ref(db, `families/${code}/verification`);
  await set(verificationRef, {
    status: 'idle',
    requestedAt: null,
    respondedAt: null,
  });
}

/**
 * Listen for real-time verification status changes
 * @returns {function} unsubscribe function
 */
export function onVerificationChange(code, callback) {
  const verificationRef = ref(db, `families/${code}/verification`);
  return onValue(verificationRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  });
}

// ──────────────────────────────────────────
// Memory Challenge Functions
// ──────────────────────────────────────────

/**
 * Save AI-generated memory challenges to Firebase
 */
export async function saveMemories(code, memories) {
  const memoriesRef = ref(db, `families/${code}/memories`);
  await set(memoriesRef, memories);
}

/**
 * Get stored memory challenges
 */
export async function getMemories(code) {
  const memoriesRef = ref(db, `families/${code}/memories`);
  const snapshot = await get(memoriesRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return [];
}

export { db };

// ──────────────────────────────────────────
// Verification History
// ──────────────────────────────────────────

/**
 * Append a verification result to the family history log (max 10 entries)
 */
export async function addHistoryEntry(code, type, respondedBy) {
  const key = `h_${Date.now()}`;
  const entryRef = ref(db, `families/${code}/history/${key}`);
  await set(entryRef, { type, respondedBy, timestamp: Date.now() });
}

/**
 * Get the last 5 history entries, newest first
 */
export async function getHistory(code) {
  const historyRef = ref(db, `families/${code}/history`);
  const snapshot = await get(historyRef);
  if (!snapshot.exists()) return [];
  return Object.values(snapshot.val())
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);
}

// ──────────────────────────────────────────
// Family Member Availability
// ──────────────────────────────────────────

/**
 * Set a family member's availability (true = available, false = busy/unavailable)
 */
export async function setFamilyAvailability(code, memberKey, available) {
  const availRef = ref(db, `families/${code}/members/${memberKey}/available`);
  await set(availRef, available);
}

/**
 * Listen for real-time changes to all family members (for availability updates)
 * @returns {function} unsubscribe function
 */
export function onFamilyMembersChange(code, callback) {
  const membersRef = ref(db, `families/${code}/members`);
  return onValue(membersRef, (snapshot) => {
    if (snapshot.exists()) callback(snapshot.val());
  });
}
