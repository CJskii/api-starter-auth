# 🚀 TypeScript Node.js API Starter

![Node.js](https://img.shields.io/badge/node-%3E%3D14-green)
![TypeScript](https://img.shields.io/badge/typescript-4.x-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)
![Docker](https://img.shields.io/badge/docker-ready-blue)

A production-ready starter template for building scalable Node.js APIs using **TypeScript**, featuring:

- 🔐 JWT Authentication Middleware
- 🗄 MongoDB Integration
- 🧪 Jest Test Suite
- 🐳 Docker & Docker Compose Support
- 🧱 Clean Project Architecture

---

# 📦 Features

- Express-based REST API
- Modular route structure
- Centralized authentication middleware
- MongoDB connection abstraction
- Mock database support for testing
- Environment-based configuration
- Production & development build scripts
- Container-ready setup

---

# ⚙️ Tech Stack

- Node.js
- TypeScript
- Express
- MongoDB
- JWT (JSON Web Tokens)
- Jest
- Docker

---

# 🛠 Installation

## 1️⃣ Clone Repository

```bash
git clone git@github.com:CJskii/api-starter-auth.git
cd your-project
```

## 2️⃣ Install Dependencies

```bash
npm install
```

---

# 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/myapp
JWT_SECRET=your-super-secret-jwt-key
```

> ⚠️ Never commit `.env` files to version control.

---

# ▶️ Running the Application

## Development Mode

```bash
npm run dev
```

- Uses `ts-node`
- No build step required
- Ideal for local development

---

## Production Mode

```bash
npm run build
npm start
```

- Compiles TypeScript → JavaScript
- Runs compiled output from `dist/`

---

## 🐳 Docker

### Build & Run

```bash
docker compose up --build
```

Starts:
- API container
- MongoDB container

### Stop Containers

```bash
docker compose down
```

---

# 📁 Project Structure

```

src/
├── index.ts              # Application entry point
├── middleware/
│   └── auth.ts           # JWT authentication middleware
├── mongodb/
│   ├── db.ts             # MongoDB connection
│   └── mock-db.ts        # Mock DB for testing
├── routes/
│   ├── hello.ts          # Health check route
│   ├── index.ts          # Route aggregator
│   └── user.ts           # User endpoints
├── utils/
│   ├── index.ts
│   └── user.ts
```

---

# 🌐 API Endpoints

## 🔑 Authentication

### Register

```http
POST /auth/register
```

### Login

```http
POST /auth/login
```

Response:

```json
{
  "token": "your-jwt-token"
}
```

---

## 👤 Users

| Method | Endpoint         | Description        |
|--------|------------------|-------------------|
| GET    | /users           | Get all users     |
| GET    | /users/:id       | Get user by ID    |
| PUT    | /users/:id       | Update user       |
| DELETE | /users/:id       | Delete user       |

---

## 👋 Hello

```http
GET /hello
```

Returns simple health check message.

---

# 🔐 Authentication Usage

Protected routes require a JWT token in the header:

```http
Authorization: Bearer <your-token>
```

---

# 🧪 Testing

Run all tests:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

---

# 📜 Available Scripts

| Script | Description |
|--------|------------|
| build | Compile TypeScript |
| start | Run compiled code |
| dev | Run in development mode |
| test | Run tests |
| test:watch | Run tests in watch mode |
| clean | Remove `dist` folder |
| docker:build | Build Docker image |
| docker:up | Start containers |
| docker:down | Stop containers |

---

# 🚀 Deployment Notes

For production:

- Use a managed MongoDB instance
- Set a strong `JWT_SECRET`
- Enable HTTPS
- Use a process manager like PM2 (if not using Docker)
- Set `NODE_ENV=production`

---

# 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.