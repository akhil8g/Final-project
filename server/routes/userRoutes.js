import express from 'express'
import { registerController} from '../controllers/userController.js';
// import { isAuth } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/multer.js';


//router object
const router = express.Router();

//routes
//register
router.post('/register', registerController);

//export
export default router;