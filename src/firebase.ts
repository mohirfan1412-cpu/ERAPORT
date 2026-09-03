import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  getDocFromServer,
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { SchoolSettings, UserAccount, ClassRoom, Student, StudentReport } from './types';
import { DEFAULT_SETTINGS, DEFAULT_USERS, DEFAULT_CLASSES, DEFAULT_STUDENTS, DEFAULT_REPORTS } from './utils/storage';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Authenticate anonymously so all Firestore operations have valid session credentials
signInAnonymously(auth).catch((err) => {
  console.warn('Firebase anonymous auth note:', err);
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
    },
    operationType,
    path,
  };
  console.warn('Firestore Operation Notice:', JSON.stringify(errInfo));
}

// Test connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'app_state', 'ping'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is offline or connecting...');
    }
    return false;
  }
}

export interface AppCloudData {
  settings: SchoolSettings;
  users: UserAccount[];
  classes: ClassRoom[];
  students: Student[];
  reports: StudentReport[];
  lastUpdated: string;
}

const STATE_DOC = 'global_data_v1';

// Clean object from undefined properties so Firestore never rejects it
function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// Save state to Cloud Firestore
export async function syncStateToFirestore(data: {
  settings?: SchoolSettings;
  users?: UserAccount[];
  classes?: ClassRoom[];
  students?: Student[];
  reports?: StudentReport[];
}): Promise<boolean> {
  try {
    const payload: Partial<AppCloudData> = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    const cleanPayload = sanitizeForFirestore(payload);
    await setDoc(doc(db, 'app_state', STATE_DOC), cleanPayload, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `app_state/${STATE_DOC}`);
    return false;
  }
}

// Subscribe to real-time Cloud updates across all devices
export function subscribeToCloudState(
  onUpdate: (data: Partial<AppCloudData>) => void,
  onError?: (err: Error) => void
) {
  try {
    const unsubscribe = onSnapshot(
      doc(db, 'app_state', STATE_DOC),
      (snapshot) => {
        if (snapshot.exists()) {
          const cloudData = snapshot.data() as Partial<AppCloudData>;
          onUpdate(cloudData);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `app_state/${STATE_DOC}`);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `app_state/${STATE_DOC}`);
    return () => {};
  }
}

// Fetch single-time cloud state
export async function fetchCloudState(): Promise<Partial<AppCloudData> | null> {
  try {
    const snap = await getDoc(doc(db, 'app_state', STATE_DOC));
    if (snap.exists()) {
      return snap.data() as Partial<AppCloudData>;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `app_state/${STATE_DOC}`);
    return null;
  }
}

// Force upload current full database to Cloud
export async function uploadFullDatabaseToCloud(data: {
  settings: SchoolSettings;
  users: UserAccount[];
  classes: ClassRoom[];
  students: Student[];
  reports: StudentReport[];
}): Promise<boolean> {
  try {
    const payload: AppCloudData = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    const cleanPayload = sanitizeForFirestore(payload);
    await setDoc(doc(db, 'app_state', STATE_DOC), cleanPayload, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `app_state/${STATE_DOC}`);
    return false;
  }
}
