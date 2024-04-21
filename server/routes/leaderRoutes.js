import express from 'express'
import { isAuth } from '../middlewares/authMiddleware.js';
import { grantRequestController, joinRequestController } from '../controllers/leaderController.js';



//router object
const router = express.Router();

//Routes

//get the Requests to join community
 router.get('/join-requests', isAuth, joinRequestController);

//grant-request
router.post('/approve-request', isAuth, grantRequestController);//pass{userId}

//export
export default router;