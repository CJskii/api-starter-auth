import { Request, Response } from 'express';
import { generateToken } from '../utils/auth';
import { dbAdapter } from '../mongodb/db-adapter';
import { IUser } from '../mongodb/user-model';
import { validateUserInput } from '../utils/zod-schemas';
import { logger } from '../utils/logger';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await dbAdapter.findAllUsers();
    res.json(users);
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await dbAdapter.findUserById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { error, isValid } = validateUserInput(req.body);
    
    if (!isValid) {
      return res.status(400).json({ message: error });
    }
    
    const { email } = req.body;
    const existingUser = await dbAdapter.findUserByEmail(email);
    
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    const userData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const user = await dbAdapter.createUser(userData);
    const token = generateToken(user);
    
    res.status(201).json({ user, token });
  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error, isValid } = validateUserInput(req.body);
    
    if (!isValid) {
      return res.status(400).json({ message: error });
    }
    
    const user = await dbAdapter.findUserById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const updatedUser = await dbAdapter.updateUser(user, updateData);
    res.json(updatedUser);
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await dbAdapter.deleteUser(id);
    
    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
