import express from 'express'
import { isAuth } from '../middlewares/authMiddleware.js';
import { allRequestsController, postRequestsController } from '../controllers/requestController.js';
import {upload} from '../middlewares/multer.js';



//router object
const router = express.Router();

//Routes
//Get all products
router.get('/requests',isAuth, allRequestsController );

//post product                                      //use this for sending picture
router.post('/post/requests', isAuth, upload.single('productPicture'),postRequestsController);

//export
export default router;