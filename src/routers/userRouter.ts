import express from 'express';
import * as authController from '../controllers/authController';
import * as userController from '../controllers/userController';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/logout', authController.protect, authController.logout);

router.route('/me').get(authController.protect, userController.whoAmI);

export default router;
