import { Router } from 'express';
import auth from "../middleware/auth";
import jwt from "jsonwebtoken";
import { IUser } from "../mongodb/user-model";
import { User } from "../mongodb/user-model";
import { Document } from "mongoose";
import { hashPassword, isValidEmail, isValidPassword, validateId } from "../utils";
import { Types } from "mongoose";
import { randomUUID } from "crypto";

const router = Router();

// GET /user - Get all users (requires auth)
router.get('/', auth, async (req, res) => {
  try {
    // Query all users from MongoDB
    const users = await User.find({}, { password: 0 }); // Exclude password field

    // Convert Mongoose documents to plain objects and add id property
    const usersWithId = users.map((user: any) => ({
      ...user,
      id: user._id,
    }));

    res.json(usersWithId);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// GET /user/:id - Get specific user (requires auth)
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    const idValidation = validateId(id);
    if (!idValidation.isValid) {
      return res.status(400).json({ message: idValidation.error });
    }

    console.log("Fetching user with ID:", id);

    // Find user by ID in MongoDB
    const user = await User.findById(id, { password: 0 });

    console.log("User found:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is authorized to access this resource
    // The auth middleware should have already verified the token and set req.user
    if ((req as any).user?.id !== user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Return user with id property (for compatibility with tests)
    res.json({
      ...user,
      id: user._id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
});

// POST /user/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, age, password } = req.body;

    console.log("Registering user:", { name, email, age });

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    // Create new user in MongoDB with hashed password
    const newUser = {
      _id: randomUUID(),
      name,
      email,
      age,
      password: hashPassword(password),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await User.create(newUser);

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id, email: newUser.email }, process.env.JWT_SECRET || "default_secret_key", {
      expiresIn: "24h",
    });

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
        message: "Email and password are required",
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Find user by email in MongoDB
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check if password matches (using hashed password)
    if (hashPassword(password) !== user.password) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || "default_secret_key", {
      expiresIn: "24h",
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
      },
      token,
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

    // Validate ID format
    const idValidation = validateId(id);
    if (!idValidation.isValid) {
      return res.status(400).json({ message: idValidation.error });
    }

    // Find user to update
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is updating their own profile
    if ((req as any).user?.id !== id) {
      return res.status(403).json({ message: "Access denied. You can only update your own profile." });
    }

    // Validate email format if provided
    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Validate password strength if provided
    if (password && !isValidPassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    // Update user
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (age !== undefined) user.age = age;
    // Hash password if it's being updated
    if (password) {
      user.password = hashPassword(password);
    }
    user.updatedAt = new Date();

    await User.save(user);

    res.json({
      ...user,
      id: user._id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
});

// DELETE /user/:id - Delete user (requires auth)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    const idValidation = validateId(id);
    if (!idValidation.isValid) {
      return res.status(400).json({ message: idValidation.error });
    }

    // Find user to delete
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is deleting their own profile
    if ((req as any).user?.id !== id) {
      return res.status(403).json({ message: "Access denied. You can only delete your own profile." });
    }

    // Remove user
    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

export { router as userRoute };
