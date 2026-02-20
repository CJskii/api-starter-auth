import { Router } from 'express';
import User, { IUser } from '../mongodb/user-model';

const router = Router();

// GET /user
router.get('/', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// GET /user/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
});

// POST /user
router.post('/', async (req, res) => {
  try {
    const { name, email, age } = req.body;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ 
        message: 'Name and email are required' 
      });
    }
    
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        message: 'User with this email already exists' 
      });
    }
    
    const user = new User({
      name,
      email,
      age
    });
    
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
});

// PUT /user/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age } = req.body;
    
    const user = await User.findByIdAndUpdate(
      id,
      { name, email, age },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
});

// DELETE /user/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

export { router as userRoute };
