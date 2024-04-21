import express from 'express'
import { isAuth } from '../middlewares/authMiddleware.js';
import { allProductsController, bookProductController, getBookedUsersController, postProductsController } from '../controllers/productController.js';
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

//Retrieve booked users
router.get('/booked-users/:productId', getBookedUsersController);

//export
export default router;