import express from 'express'
import { isAuth } from '../middlewares/authMiddleware.js';
import { allProductsController } from '../controllers/productController.js';


//router object
const router = express.Router();

//Routes

router.get('/products',isAuth, allProductsController );

//export
export default router;