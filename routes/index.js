import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController.js';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const router = Router();
// Define the two routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);
router.get('/auth', AuthController.getConnect);
router.post('/users', UsersController.postNew);
router.post('/files', FilesController.postUpload);
router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);

router.put('/files/:id/publish', FilesController.putPublish);
router.put('/files/:id/unpublish', FilesController.putUnpublish);

router.get('/files/:id/data', FilesController.getFile);

export default router;
