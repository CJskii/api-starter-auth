import request from 'supertest';
import app from '../src/index';
import { connect, closeDatabase, clearDatabase } from "../src/mongodb/db";


beforeAll(async () => {
  await connect();
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

describe('User API', () => {
  let authToken: string;
  let userId: string;

  describe('POST /user/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        age: 30
      };

      const response = await request(app)
        .post('/api/user/register')
        .send(userData)
        .expect(201);

      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.age).toBe(userData.age);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).not.toHaveProperty('password');

      userId = response.body.user.id;
      authToken = response.body.token;
    });

    it('should not register a user with existing email', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'john@example.com', // existing email
        password: 'password456'
      };

      await request(app)
        .post('/api/user/register')
        .send(userData)
        .expect(409);
    });

    it('should not register a user without required fields', async () => {
      const userData = {
        name: 'Jane Doe',
        // missing email and password
      };

      await request(app)
        .post('/api/user/register')
        .send(userData)
        .expect(400);
    });

    it('should not register a user with invalid email format', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'invalid-email',
        password: 'password456'
      };

      await request(app)
        .post('/api/user/register')
        .send(userData)
        .expect(400);
    });

    it('should not register a user with weak password', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'weak@example.com',
        password: 'short'
      };

      await request(app)
        .post('/api/user/register')
        .send(userData)
        .expect(400);
    });
  });

  describe('POST /user/login', () => {
    it('should login an existing user', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/user/login')
        .send(loginData)
        .expect(200);

      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not login with invalid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };

      await request(app)
        .post('/api/user/login')
        .send(loginData)
        .expect(401);
    });

    it('should not login with invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'password123'
      };

      await request(app)
        .post('/api/user/login')
        .send(loginData)
        .expect(400);
    });

    it('should not login with missing fields', async () => {
      const loginData = {
        email: 'john@example.com'
        // missing password
      };

      await request(app)
        .post('/api/user/login')
        .send(loginData)
        .expect(400);
    });
  });

  describe('GET /user', () => {
    it('should get all users (requires auth)', async () => {
      const response = await request(app)
        .get('/api/user')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should not get all users without auth token', async () => {
      await request(app)
        .get('/api/user')
        .expect(401);
    });
  });

  describe('GET /user/:id', () => {
    it('should get a specific user by ID (requires auth)', async () => {
      const response = await request(app)
        .get(`/api/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(userId);
    });

    it('should not get a user without auth token', async () => {
      await request(app)
        .get(`/api/user/${userId}`)
        .expect(401);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/api/user/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 400 for invalid ObjectId format', async () => {
      await request(app)
        .get('/api/user/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('PUT /user/:id', () => {
    it('should update user profile (requires auth)', async () => {
      const updateData = {
        name: 'John Smith',
        age: 31
      };

      const response = await request(app)
        .put(`/api/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.age).toBe(updateData.age);
    });

    it('should not update user profile without auth token', async () => {
      const updateData = {
        name: 'John Smith',
        age: 31
      };

      await request(app)
        .put(`/api/user/${userId}`)
        .send(updateData)
        .expect(401);
    });

    it('should not update another user profile', async () => {
      // First create a second user
      const secondUser = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password456'
      };

      const registerResponse = await request(app)
        .post('/api/user/register')
        .send(secondUser)
        .expect(201);

      const secondUserId = registerResponse.body.user.id;
      const secondUserToken = registerResponse.body.token;

      // Try to update first user with second user's token
      const updateData = {
        name: 'Jane Smith',
        age: 25
      };

      await request(app)
        .put(`/api/user/${userId}`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send(updateData)
        .expect(403);
    });

    it('should update user password', async () => {
      const updateData = {
        password: 'newpassword123'
      };

      const response = await request(app)
        .put(`/api/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('id');
    });

    it('should not update to invalid email format', async () => {
      const updateData = {
        email: 'invalid-email'
      };

      await request(app)
        .put(`/api/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);
    });

    it('should not update to weak password', async () => {
      const updateData = {
        password: 'short'
      };

      await request(app)
        .put(`/api/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);
    });

    it('should return 400 for invalid ObjectId format', async () => {
      const updateData = {
        name: 'Test User'
      };

      await request(app)
        .put('/api/user/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);
    });
  });

  describe('DELETE /user/:id', () => {
    it('should delete user profile (requires auth)', async () => {
      const response = await request(app)
        .delete(`/api/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('User deleted successfully');
    });

    it('should not delete user profile without auth token', async () => {
      await request(app)
        .delete(`/api/user/${userId}`)
        .expect(401);
    });

    it('should not delete another user profile', async () => {
      // Create a new user for this test
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password789'
      };

      const registerResponse = await request(app)
        .post('/api/user/register')
        .send(newUser)
        .expect(201);

      const newUserId = registerResponse.body.user.id;
      const newToken = registerResponse.body.token;

      // Try to delete with wrong token
      await request(app)
        .delete(`/api/user/${newUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });

    it('should return 400 for invalid ObjectId format', async () => {
      await request(app)
        .delete('/api/user/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });
});
