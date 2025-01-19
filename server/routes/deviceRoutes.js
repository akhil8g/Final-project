import express from 'express'
import { addDeviceController, changeDeviceStateController, getUserDevicesController } from '../controllers/deviceController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router();

//routes
//register
router.post('/add-device', authMiddleware, addDeviceController);
router.get('/get-devices', authMiddleware, getUserDevicesController)
router.get('/change-device-state',changeDeviceStateController)

export default router;