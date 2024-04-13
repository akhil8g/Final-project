import express from 'express'
import { getUserProfileController, loginController, logoutController, registerController, updateUserDetailsController, updateUserPasswordController, verifyUserController } from '../controllers/userController.js';
import { isAuth } from '../middlewares/authMiddleware.js';

//router object
const router = express.Router();

//routes
//register
router.post('/register', registerController);

//login
router.post('/login',loginController);

//verification
router.get('/verify',verifyUserController);

//profile
router.get('/profile',isAuth, getUserProfileController);

//logout
router.get('/logout',logoutController);

// Update user details route
router.put('/update-details', isAuth, updateUserDetailsController);

//Update password
router.put('/update-password',isAuth,updateUserPasswordController);

//export
export default router;