import express from 'express'
import { isAuth } from '../middlewares/authMiddleware.js';
import { allRequestsController, grantRequestController, myItemsRequestsController, postRequestsController } from '../controllers/requestController.js';
import {upload} from '../middlewares/multer.js';



//router object
const router = express.Router();

//Routes
//Get all products
router.get('/requests',isAuth, allRequestsController );

//post product                                      //use this for sending picture
router.post('/post/requests', isAuth, upload.single('productPicture'),postRequestsController);

//myitems get requests
router.get('/my-items/requests', isAuth, myItemsRequestsController);

//Grant request
router.post('/grant-req', isAuth,grantRequestController)//pass memberId and productName



//export
export default router;