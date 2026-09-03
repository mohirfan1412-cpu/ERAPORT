import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  getDocFromServer,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { SchoolSettings, UserAccount, ClassRoom, Student, StudentReport } from './types';
import { DEFAULT_SETTINGS, DEFAULT_USERS, DEFAULT_CLASSES, DEFAULT_STUDENTS, DEFAULT_REPORTS } from './utils/storage';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

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

// Save all state to Cloud Firestore
export async function syncStateToFirestore(data: {
  settings?: SchoolSettings;
  users?: UserAccount[];
  classes?: ClassRoom[];
  students?: Student[];
  reports?: StudentReport[];
}) {
  try {
    const payload: Partial<AppCloudData> = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    await setDoc(doc(db, 'app_state', STATE_DOC), payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `app_state/${STATE_DOC}`);
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
        } else {
          // If first time, initialize with default / current local storage data
          const initialPayload: AppCloudData = {
            settings: DEFAULT_SETTINGS,
            users: DEFAULT_USERS,
            classes: DEFAULT_CLASSES,
            students: DEFAULT_STUDENTS,
            reports: DEFAULT_REPORTS,
            lastUpdated: new Date().toISOString(),
          };
          setDoc(doc(db, 'app_state', STATE_DOC), initialPayload, { merge: true }).catch((e) =>
            handleFirestoreError(e, OperationType.WRITE, `app_state/${STATE_DOC}`)
          );
          onUpdate(initialPayload);
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
