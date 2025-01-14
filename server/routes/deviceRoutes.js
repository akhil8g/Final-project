import express from 'express'
import { addDeviceController } from '../controllers/deviceController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router();

//routes
//register
router.post('/add-device', authMiddleware, addDeviceController);

export default router;