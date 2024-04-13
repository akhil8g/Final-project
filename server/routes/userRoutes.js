import express from 'express'
import { getUserProfileController, loginController, logoutController, registerController, verifyUserController } from '../controllers/userController.js';
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
//export
export default router;