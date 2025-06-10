import express from 'express';
import {
  getAllUsers,
  getUserById,
  registerUser,
  loginUser,      // Pastikan ini di-import
  updateUser,
  deleteUser
} from '../controller/UserController.js';

const router = express.Router();

// Route untuk register dan login (tidak perlu token)
router.post('/register', registerUser);
router.post('/login', loginUser);     // Pastikan route ini ada

// Route yang memerlukan authentication
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;