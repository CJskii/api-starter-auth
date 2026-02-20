import { Router } from 'express';
import auth from "../middleware/auth";
import jwt from "jsonwebtoken";

const router = Router();

// Mock user data storage
let mockUsers: any[] = [];

// GET /user - Get all users (requires auth)
router.get('/', auth, async (req, res) => {
  try {
    // Mock implementation - in a real app this would query the database
    res.json(mockUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// GET /user/:id - Get specific user (requires auth)
router.get('/:id', auth, async (req, res) => {
  try {
    const user = mockUsers.find(u => u._id === req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is authorized to access this resource
    if ((req as any).user?.id !== user._id) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Return user with id property (for compatibility with tests)
    res.json({
      ...user,
      id: user._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
});

// POST /user/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, age, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    // Check if user already exists
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    // Mock user creation with minimal properties
    const newUser = {
      _id: (mockUsers.length + 1).toString(),
      name,
      email,
      age,
      password,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockUsers.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || "default_secret_key",
      { expiresIn: "24h" },
    );

    res.status(201).json({
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        age: newUser.age,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
});

// POST /user/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }
    
    // Mock user lookup - in a real app this would query the database
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }
    
    // Check if password matches
    if (password !== user.password) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || 'default_secret_key',
      { expiresIn: '24h' }
    );
    
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});

// PUT /user/:id - Update user (requires auth)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age, password } = req.body;

    // Find user to update
    const userIndex = mockUsers.findIndex(u => u._id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is updating their own profile
    if ((req as any).user?.id !== id) {
      return res.status(403).json({ message: "Access denied. You can only update your own profile." });
    }
    
    // Update user
    const updatedUser = { 
      ...mockUsers[userIndex], 
      name, 
      email, 
      age, 
      password,
      updatedAt: new Date()
    };
    
    mockUsers[userIndex] = updatedUser;
    
    res.json({
      ...updatedUser,
      id: updatedUser._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
});

// DELETE /user/:id - Delete user (requires auth)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Find user to delete
    const userIndex = mockUsers.findIndex(u => u._id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is deleting their own profile
    if ((req as any).user?.id !== id) {
      return res.status(403).json({ message: "Access denied. You can only delete your own profile." });
    }

    // Remove user
    mockUsers.splice(userIndex, 1);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

export { router as userRoute };
