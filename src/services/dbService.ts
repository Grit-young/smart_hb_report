import { db } from '../firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, query, where, serverTimestamp, orderBy, getDoc } from 'firebase/firestore';
import { ReportData } from '../types';
import { auth } from '../firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const saveReportToDB = async (report: ReportData): Promise<void> => {
  if (!auth.currentUser) throw new Error("User not authenticated");
  
  const reportRef = doc(db, 'reports', report.id!);
  try {
    await setDoc(reportRef, {
      ...report,
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'reports/' + report.id);
  }
};

export const fetchReportsFromDB = async (): Promise<ReportData[]> => {
  if (!auth.currentUser) return [];

  const reportsRef = collection(db, 'reports');
  const q = query(reportsRef, where('userId', '==', auth.currentUser.uid));
  
  try {
    const snapshot = await getDocs(q);
    const reports: ReportData[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      reports.push({
        ...data,
        id: docSnap.id,
        created_at: data.createdAt ? data.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString(),
      } as ReportData);
    });
    // Sort by created_at descending locally since we don't have a composite index 
    // for userId and createdAt yet. Or we can just sort locally for now.
    reports.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
    return reports;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'reports');
    return [];
  }
};

export const deleteReportFromDB = async (reportId: string): Promise<void> => {
  if (!auth.currentUser) throw new Error("User not authenticated");

  const reportRef = doc(db, 'reports', reportId);
  try {
    await deleteDoc(reportRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'reports/' + reportId);
  }
};
