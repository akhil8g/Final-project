import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import dotenv from 'dotenv';

dotenv.config(); // Make sure this is at the top!

// Getting values from the .env
// const {
//     FIREBASE_API_KEY,
//     FIREBASE_AUTH_DOMAIN,
//     FIREBASE_PROJECT_ID,
//     FIREBASE_STORAGE_BUCKET,
//     FIREBASE_MESSAGING_SENDER_ID,
//     FIREBASE_APP_ID,
//     FIREBASE_MEASUREMENT_ID
// } = process.env;

// const firebaseConfig = {
//   apiKey: FIREBASE_API_KEY,
//   authDomain: FIREBASE_AUTH_DOMAIN,
//   projectId: FIREBASE_PROJECT_ID,
//   storageBucket: FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
//   appId: FIREBASE_APP_ID,
//   measurementId: FIREBASE_MEASUREMENT_ID
// };
const firebaseConfig = {
    apiKey: "AIzaSyCHNoUBChI5jOiLZC-I6iBUolHVbJDQoak",
    authDomain: "smart-energy-e1ec5.firebaseapp.com",
    projectId: "smart-energy-e1ec5",
    storageBucket: "smart-energy-e1ec5.firebasestorage.app",
    messagingSenderId: "998015539389",
    appId: "1:998015539389:web:67657e3284a91f9cf6bfd4",
    measurementId: "G-8XY3P4DRLX"
  };
  

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export { firebaseAuth, db }; // Export initialized auth and db for use in controllers.
