import { Router } from 'express';
import auth from "../middleware/auth";
import jwt from "jsonwebtoken";
import { User, IUser } from "../mongodb/user-model";
import { hashPassword, isValidEmail, isValidPassword, validateId, logger } from "../utils";

const router = Router();

// GET /user - Get all users (requires auth)
router.get('/', auth, async (req, res) => {
  try {
    logger.info("Fetching all users");
    
    // Query all users from MongoDB
    const users = await User.find({}, { password: 0 }); // Exclude password field

    // Convert Mongoose documents to plain objects and add id property
    const usersWithId = users.map((user: any) => ({
      ...user,
      id: user._id,
    }));

    logger.info("Successfully fetched users", { count: users.length });
    res.json(usersWithId);
  } catch (error) {
    logger.error("Error fetching users", { error });
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// GET /user/:id - Get specific user (requires auth)
router.get("/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    logger.info("Fetching user by ID", { id });

    // Validate ID format
    const idValidation = validateId(id);
    if (!idValidation.isValid) {
      logger.warn("Invalid ID format", { id });
      return res.status(400).json({ message: idValidation.error });
    }

    // Find user by ID in MongoDB
    const user = await User.findById(id, { password: 0 });

    if (!user) {
      logger.warn("User not found", { id });
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is authorized to access this resource
    // The auth middleware should have already verified the token and set req.user
    if ((req as any).user?.id !== user._id.toString()) {
      logger.warn("Access denied for user", { userId: (req as any).user?.id, requestedId: id });
      return res.status(403).json({ message: "Access denied" });
    }

    // Return user with id property (for compatibility with tests)
    logger.info("Successfully fetched user", { id: user._id });
    res.json({
      ...user,
      id: user._id,
    });
  } catch (error) {
    logger.error("Error fetching user", { id, error });
    res.status(500).json({ message: "Error fetching user", error });
  }
});

// POST /user/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, age, password } = req.body;
    logger.info("Registering new user", { name, email });

    // Validate required fields
    if (!name || !email || !password) {
      logger.warn("Missing required fields for registration", { name, email });
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      logger.warn("Invalid email format", { email });
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      logger.warn("Password too short", { password });
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn("User already exists", { email });
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    // Create new user in MongoDB with hashed password
    const newUser = {
      name,
      email,
      age,
      password: hashPassword(password),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const savedUser = await User.create(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { id: savedUser._id, email: savedUser.email },
      process.env.JWT_SECRET || "default_secret_key",
      {
        expiresIn: "24h",
      },
    );

    logger.info("User registered successfully", { id: savedUser._id, email: savedUser.email });
    res.status(201).json({
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        age: savedUser.age,
      },
      token,
    });
  } catch (error) {
    logger.error("Error creating user", { error });
    res.status(500).json({ message: 'Error creating user', error });
  }
});

// POST /user/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    logger.info("User login attempt", { email });

    // Validate required fields
    if (!email || !password) {
      logger.warn("Missing email or password for login", { email });
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      logger.warn("Invalid email format for login", { email });
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Find user by email in MongoDB
    const user = await User.findOne({ email });

    if (!user) {
      logger.warn("User not found for login", { email });
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check if password matches (using hashed password)
    if (hashPassword(password) !== user.password) {
      logger.warn("Invalid password for user", { email });
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || "default_secret_key", {
      expiresIn: "24h",
    });

    logger.info("User login successful", { id: user._id, email: user.email });
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
    logger.error("Error logging in", { error });
    res.status(500).json({ message: 'Error logging in', error });
  }
});

// PUT /user/:id - Update user (requires auth)
router.put("/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    const { name, email, age, password } = req.body;
    logger.info("Updating user", { id });

    // Validate ID format
    const idValidation = validateId(id);
    if (!idValidation.isValid) {
      logger.warn("Invalid ID format for update", { id });
      return res.status(400).json({ message: idValidation.error });
    }

    // Find user to update
    const user = await User.findById(id);

    if (!user) {
      logger.warn("User not found for update", { id });
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is updating their own profile
    if ((req as any).user?.id !== id) {
      logger.warn("Access denied for user update", { userId: (req as any).user?.id, requestedId: id });
      return res.status(403).json({ message: "Access denied. You can only update your own profile." });
    }

    // Validate email format if provided
    if (email && !isValidEmail(email)) {
      logger.warn("Invalid email format for update", { email });
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Validate password strength if provided
    if (password && !isValidPassword(password)) {
      logger.warn("Password too short for update", { password });
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

    logger.info("User updated successfully", { id: user._id });
    res.json({
      ...user,
      id: user._id,
    });
  } catch (error) {
    logger.error("Error updating user", { id, error });
    res.status(500).json({ message: "Error updating user", error });
  }
});

// DELETE /user/:id - Delete user (requires auth)
router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    logger.info("Deleting user", { id });

    // Validate ID format
    const idValidation = validateId(id);
    if (!idValidation.isValid) {
      logger.warn("Invalid ID format for deletion", { id });
      return res.status(400).json({ message: idValidation.error });
    }

    // Find user to delete
    const user = await User.findById(id);

    if (!user) {
      logger.warn("User not found for deletion", { id });
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is deleting their own profile
    if ((req as any).user?.id !== id) {
      logger.warn("Access denied for user deletion", { userId: (req as any).user?.id, requestedId: id });
      return res.status(403).json({ message: "Access denied. You can only delete your own profile." });
    }

    // Remove user
    await User.findByIdAndDelete(id);
    logger.info("User deleted successfully", { id: user._id });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    logger.error("Error deleting user", { id, error });
    res.status(500).json({ message: "Error deleting user", error });
  }
});

export { router as userRoute };
