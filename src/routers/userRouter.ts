import express from 'express';
import * as userController from '../controllers/userController';

const router = express.Router();

router.post('/signup', userController.signup);

export default router;
