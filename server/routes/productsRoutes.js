import express from 'express'
import { isAuth } from '../middlewares/authMiddleware.js';
import { allProductsController, bookProductController, getMyItemsRentInController, getMyItemsRentOutController, grantBookingController, postProductsController, reportUserController, returnedController } from '../controllers/productController.js';
import {upload} from '../middlewares/multer.js';


//router object
const router = express.Router();

//Routes
//Get all products
router.get('/products',isAuth, allProductsController );

//post product                                      //use this for sending picture
router.post('/post/products', isAuth, upload.single('productPicture'), postProductsController);

//book a product
router.post('/book/products', isAuth, bookProductController);

//Retrieve my items,booked users or given to
router.get('/my-items/rent-out', isAuth, getMyItemsRentOutController);

//myitems rent-in
router.get('/my-items/rent-in', isAuth, getMyItemsRentInController);

//my-items returned button
router.post('/my-items/returned', isAuth, returnedController);

//Grant Booking request
router.post('/grant-booking',isAuth, grantBookingController);

//report
router.post('/report', isAuth, reportUserController);//pass { userId, reportReason }


//export
export default router;