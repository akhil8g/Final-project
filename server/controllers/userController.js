import userModel from "../models/userModel.js";
import nodemailer from 'nodemailer';
import { v4 as uuidv4} from 'uuid';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import {v2 as cloudinary} from 'cloudinary';

dotenv.config();

//verification functions
const vemail = process.env.VERIFY_EMAIL;
const vpass = process.env.VERIFY_PASS;
//Creating transporter for nodemailer
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.VERIFY_EMAIL,
      pass: process.env.VERIFY_PASS
    }
  });

// Generate a unique verification token
function generateVerificationToken() {
    return uuidv4();
  }

  // Send verification email
function sendVerificationEmail(email, token) {
    const mailOptions = {
      from: process.env.VERIFY_EMAIL,
      to: email,
      subject: 'Email Verification',
      html: `
        <p>Click the following link to verify your email:</p>
        <a href="http://localhost:${process.env.PORT}/api/v1/user/verify?token=${token}">Verify Email</a>
      `
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending verification email:', error);
      } else {
        console.log('Verification email sent:', info.response);
      }
    });
  }




export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    //validation
    if (!name || !email || !password || !phone) {
      return res.status(500).send({
        success: false,
        message: "Please provide all fields"
      });
    }

    //check existing user
    const existingUser = await userModel.findOne({email});
    if(existingUser){
        return res.status(500).send({
            success: false,
            message: 'email already taken'
        });
    }

    // Generate verification token
    const token = generateVerificationToken();

    // Send verification email
    await sendVerificationEmail(email, token);

    const user = await userModel.create({ 
        name, 
        email, 
        password, 
        phone,
        verificationToken:token,
        verified: false
    });
    console.log(user);
    res.status(200).send({
        success:true,
        message:'Registration success, please login',
        user
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Register api",
      error,
    });
  }
};

export const verifyUserController = (req,res) => {
    const token1 = req.query.token;
  // Here you would validate the token against your database
  // Example: Validate against MongoDB
  // Replace this with your actual database logic
  userModel.findOneAndUpdate(
    { verificationToken: token1 },
    { verified: true, verificationToken: null }
  ).then(user => {
    if (!user) {
      res.status(400).send('Invalid or expired verification token');
    } else {
      res.status(200).send('Email verified successfully!');
    }
  })
  .catch(err => {
    console.error('Error verifying email:', err);
    res.status(500).send('Error verifying email');
  });
  
}


//login controller

export const loginController = async (req,res) =>{
    try{
        const {email,password} = req.body;
        //validation
        if(!email || !password){
            return res.status(500).send({
                success:false,
                message: 'Please add email or password'
            });
        }
        //check user
        const user = await userModel.findOne({email});
        //user validation
        if(!user){
            return res.status(404).send({
                success:false,
                message: 'User Not Found'
            });
        }
        //check password
        const isMatch = await user.comparePassword(password);
        if(!isMatch){
            return res.status(500).send({
                success:false,
                message: 'invalid credentials'
            });
        }
        else if (!user.verified) {
            return res.status(403).send({
                success:false,
                message:'Email not verified'
            });
          }
        //token
        const jtoken = user.generateToken();
        res.status(200).cookie("token",jtoken,{
            expires: new Date(Date.now()+ 3 * 24 * 60 * 1000),
            httpOnly: process.env.NODE_ENV === "development"?true:false,
            // secure : process.env.NODE_ENV === "development"?true:false,
            sameSite : process.env.NODE_ENV === "development"?true:false
            
            
        }).send({
            success:true,
            message: 'Login successfull',
            user,
            jtoken
        });
    }catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            message: 'Error in Login Api',
            error
        });
    }
};

//GET USER PROFILE
export const getUserProfileController = async (req,res)=> {
    try {
        const user = await userModel.findById(req.user._id);
        user.password = undefined;
        res.status(200).send({
            success:true,
            message: "User profile fetched successfully",
            user
        });
    } catch (error) {
        console.log(error); 
        res.status(500).send({
            success:false,
            message: 'Error in profile api',
            error
        });
    }
};

//logout controller

// logoutController.js

export const logoutController = (req, res) => {
  // Clear the JWT cookie from the client-side
  res.clearCookie('token');
  
  // Send a success response indicating successful logout
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};


//update profile controller
export const updateUserDetailsController = async (req, res) => {
  try {
      // Extract updated user details from the request body
      const {name, password, phone} = req.body;

      // Get the user ID from the authenticated user data attached to the request object
      const userId = req.user._id;

      let updatedPassword;
      if (password) {
        // Hash the password using bcrypt
        updatedPassword = await bcrypt.hash(password, 10);
    }

      // Update all user details in the database
      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { name, password:updatedPassword, phone }, // Exclude the email field from the update
        { new: true }
    );

      // Send a success response with the updated user data
      res.status(200).json({
          success: true,
          message: 'User details updated successfully',
          user: updatedUser
      });
  } catch (error) {
      console.error('Error updating user details:', error);
      res.status(500).json({
          success: false,
          message: 'Error in updating profile',
          error: error.message
      });
  }
};

//Update password controller

export const updateUserPasswordController = async (req, res) => {
  try {
      // Extract old and new passwords from request body
      const { oldPassword, newPassword } = req.body;

      // Check if old password is the same as the new password
      if (oldPassword === newPassword) {
          return res.status(400).json({
              success: false,
              message: 'New password must be different from the old password'
          });
      }

      // Get user ID from authenticated user data attached to the request object
      const userId = req.user._id;

      // Find the user by ID
      const user = await userModel.findById(userId);

      // Check if the user exists
      if (!user) {
          return res.status(404).json({
              success: false,
              message: 'User not found'
          });
      }

      // Compare the old password with the existing password
      const isPasswordValid = await user.comparePassword(oldPassword);
      if (!isPasswordValid) {
          return res.status(400).json({
              success: false,
              message: 'Invalid old password'
          });
      }

      // Update user's password
      user.password = newPassword;

      // Save the updated user
      await user.save();

      // Send a success response
      res.status(200).json({
          success: true,
          message: 'Password updated successfully'
      });
  } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message
      });
  }
};

// update profile picture controller

export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Upload image to Cloudinary
    cloudinary.uploader.upload_stream({ resource_type: 'auto' }, async (error, result) => {
      if (error) {
        console.error('Error uploading profile picture to Cloudinary:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }

      // Update user profile with profile picture URL
      const userId = req.user._id; // Assuming user data is attached to the request object
      const user = await userModel.findById(userId);

      // Delete existing profile picture from Cloudinary if it exists
      if (user.profilePictureUrl) {
        const publicId = user.profilePictureUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }

      // Update user profile with new profile picture URL
      user.profilePictureUrl = result.secure_url;
      await user.save();

      res.status(200).json({ profilePictureUrl: result.secure_url });
    }).end(req.file.buffer);

  } catch (error) {
    console.error('Error uploading profile picture to Cloudinary:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
