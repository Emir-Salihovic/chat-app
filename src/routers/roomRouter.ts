import express from 'express';
import * as roomController from '../controllers/roomController';

const router = express.Router();

router.post('/', roomController.createRoom);

export default router;
