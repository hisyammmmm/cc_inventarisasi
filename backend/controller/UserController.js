import bcrypt from 'bcrypt';
import User from '../models/UserModel.js';
import { Op } from 'sequelize';

// Get all user
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error.message
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving user',
      error: error.message
    });
  }
};

// Register user
const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validasi input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }

    // Cek apakah username atau email sudah ada
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Buat pengguna baru
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    // Hapus password dari response
    const userResponse = newUser.toJSON();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during registration',
      error: error.message
    });
  }
};

// Login user - Fixed version
const loginUser = async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Cari user berdasarkan email
    const user = await User.findOne({ where: { email } });
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Verifikasi password dengan bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Update waktu login terakhir - HANYA jika field ada
    try {
      if (user.lastLogin !== undefined) {
        await user.update({ lastLogin: new Date() });
      }
    } catch (updateError) {
      console.log('Warning: Could not update lastLogin:', updateError.message);
    }

    // Kirim respons - FIX: pastikan field konsisten
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username, // ✅ Fix: pakai 'username' bukan 'name'
        email: user.email,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message,
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, isActive } = req.body;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check for existing email/username (excluding current user)
    if (email || username) {
      const existingUser = await User.findOne({
        where: {
          id: { [Op.ne]: id },
          [Op.or]: [
            ...(email ? [{ email }] : []),
            ...(username ? [{ username }] : [])
          ]
        }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email or username already exists'
        });
      }
    }
    
    // Update user
    await user.update({
      ...(username && { username }),
      ...(email && { email }),
      ...(role && { role }),
      ...(isActive !== undefined && { isActive })
    });
    
    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: userResponse
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    await user.destroy();
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

export {
  getAllUsers,
  getUserById,
  registerUser,
  loginUser,
  updateUser,
  deleteUser
};