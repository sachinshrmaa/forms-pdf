import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if Firebase config is fully provided
const isFirebaseConfigured =
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket;

let app;
let db: any = null;
let storage: any = null;
let useMock = true;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    storage = getStorage(app);
    useMock = false;
    console.log("Firebase successfully initialized.");
  } catch (error) {
    console.error("Error initializing Firebase, falling back to mock mode:", error);
    useMock = true;
  }
} else {
  console.warn(
    "Firebase environment variables are missing. App is running in Local Storage fallback mode."
  );
  useMock = true;
}

export { db, storage, useMock };

// Helper interfaces for type safety
export interface StudentData {
  id?: string;
  studentName: string;
  gender: string;
  abcId: string;
  enrollmentNo: string;
  yearOfAdmission: string;
  dob: string;
  dobProofUrl: string;
  dobProofName?: string;
  programmeName: string;
  programmeCode: string;
  specialization: string;
  careerType: string;
  programmeDuration: string;
  currentYear: string;
  lateralEntry: string;
  department: string;
  school: string;
  differentlyAbled: string;
  disabilityCertUrl?: string;
  disabilityCertName?: string;
  socialCategory: string;
  categoryCertUrl?: string;
  categoryCertName?: string;
  religion: string;
  ews: string;
  ewsCertUrl?: string;
  ewsCertName?: string;
  householdIncome: number;
  state: string;
  country: string;
  scholarshipFullSource: string;
  scholarshipFullName: string;
  scholarshipFullAmount: number;
  scholarshipPartialSource: string;
  scholarshipPartialName: string;
  scholarshipPartialAmount: number;
  finalYearStatus: string;
  submittedAt: string;
}
