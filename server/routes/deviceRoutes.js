import express from 'express'
import { addDeviceController, getUserDevicesController } from '../controllers/deviceController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router();

//routes
//register
router.post('/add-device', authMiddleware, addDeviceController);
router.get('/get-devices', authMiddleware, getUserDevicesController)

export default router;