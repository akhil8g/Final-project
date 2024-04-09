import express from 'express'
import { loginController, registerController, verifyUserController } from '../controllers/userController.js';

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

//export
export default router;