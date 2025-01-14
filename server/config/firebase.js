import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

dotenv.config(); // Make sure this is at the top!

// Getting values from the .env
const {
    FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID
} = process.env;

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID
};
  const firebaseApp = initializeApp(firebaseConfig);
  const firebaseAuth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  const serviceAccount = JSON.parse(
    await readFile(new URL('./smart-energy-e1ec5-firebase-adminsdk-j90k3-afbaf8b05d.json', import.meta.url))
  );
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Optional: specify the Firebase database URL (if using Realtime Database)
    //databaseURL: "https://your-project-id.firebaseio.com",
  });
  
  // Export initialized Firebase client app (auth and db) and Firebase Admin SDK
  export { firebaseAuth, db};
  export default admin