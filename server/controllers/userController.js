import { v4 as uuidv4} from 'uuid';
import dotenv from 'dotenv';
import {v2 as cloudinary} from 'cloudinary';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../config/firebase.js";  // Firestore DB initialization



const __dirname = dirname(fileURLToPath(import.meta.url));


dotenv.config();

// Generate a unique verification token
function generateVerificationToken() {
    return uuidv4();
  }
  
  export const registerController = async (req, res) => {
    try {
      const { name, email, password} = req.body;
        
      // Validation: Check if all fields are provided
      if (!name || !email || !password) {
        return res.status(500).send({
          success: false,
          message: "Please provide all fields",
        });
      }
  
      // Initialize Firebase Auth
      const auth = getAuth();
  
      // Create user using Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Generate a token (if needed for custom actions) - Firebase handles email verification automatically
      const token = await user.getIdToken();
  
      // Store additional user info in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email, // Optional: Store token if you need it for additional purposes
        createdAt: Timestamp.fromDate(new Date()),
      });
  
      // Send verification email using Firebase (built-in feature)
      await user.sendEmailVerification();
  
      // Respond with success message
      res.status(200).send({
        success: true,
        message: "Registration success, please check your email for verification.",
        user: {
          uid: user.uid,
          name,
          email,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error in Register API",
        error: error.message,
      });
    }
  };
  

