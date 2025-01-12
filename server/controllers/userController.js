import { v4 as uuidv4} from 'uuid';
import dotenv from 'dotenv';
import {v2 as cloudinary} from 'cloudinary';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword} from "firebase/auth";
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
      const { name, email, password } = req.body;
  
      // Validation: Check if all fields are provided
      if (!name || !email || !password) {
        return res.status(400).send({
          success: false,
          message: "Please provide all fields",
        });
      }
  
      // Initialize Firebase Auth
      const auth = getAuth();
  
      // Attempt to create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Send verification email
      await sendEmailVerification(user);
  
      // Store additional user info in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        createdAt: Timestamp.fromDate(new Date()),
      });
  
      // Respond with success message
      res.status(200).send({
        success: true,
        message: "Registration successful. A verification email has been sent to your email address.",
        user: {
          uid: user.uid,
          name,
          email,
        },
      });
    } catch (error) {
      console.error(error);
  
      // Handle Firebase error codes
      if (error.code === "auth/email-already-in-use") {
        return res.status(400).send({
          success: false,
          message: "The email address is already in use by another account.",
        });
      }
  
      res.status(500).send({
        success: false,
        message: "Error in Register API",
        error: error.message,
      });
    }
  };

  export const loginController = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Validate request body
      if (!email || !password) {
        return res.status(400).send({
          success: false,
          message: "Please provide both email and password.",
        });
      }
  
      // Initialize Firebase Auth
      const auth = getAuth();
  
      // Sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Get an authentication token
      const token = await user.getIdToken();
  
      // Check if email is verified
      if (!user.emailVerified) {
        return res.status(403).send({
          success: false,
          message: "Please verify your email before logging in.",
        });
      }
  
      // Respond with user details and token
      res.status(200).send({
        success: true,
        message: "Login successful.",
        user: {
          uid: user.uid,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      console.error(error);
  
      // Handle Firebase errors
      if (error.code === "auth/user-not-found") {
        return res.status(404).send({
          success: false,
          message: "User not found. Please register first.",
        });
      }
  
      if (error.code === "auth/wrong-password") {
        return res.status(401).send({
          success: false,
          message: "Invalid email or password.",
        });
      }
  
      res.status(500).send({
        success: false,
        message: "Error in Login API",
        error: error.message,
      });
    }
  };
  

