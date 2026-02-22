# 🚀 TypeScript Node.js API Starter

![Node.js](https://img.shields.io/badge/node-%3E%3D24-green)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)
![Docker](https://img.shields.io/badge/docker-ready-blue)

A production-ready starter template for building scalable Node.js APIs
using **TypeScript**, featuring:

-   🔐 JWT Authentication Middleware
-   🗄 MongoDB Integration
-   🧪 Jest Test Suite
-   🐳 Docker & Docker Compose Support
-   🧱 Clean Project Architecture
-   📊 Advanced Logging with Levels

------------------------------------------------------------------------

# 📦 Features

-   Express-based REST API
-   Modular route structure
-   Centralized authentication middleware
-   MongoDB connection abstraction
-   Mock database support for testing
-   Environment-based configuration
-   Production & development build scripts
-   Container-ready setup
-   Advanced logging with configurable levels

------------------------------------------------------------------------

# ⚙️ Tech Stack

-   Node.js
-   TypeScript
-   Express
-   MongoDB
-   JWT (JSON Web Tokens)
-   Jest
-   Docker
-   Winston (Logging)
-   ZOD (Validation)

------------------------------------------------------------------------

# 🛠 Installation

## 1️⃣ Clone Repository

``` bash
git clone git@github.com:CJskii/api-starter-auth.git
cd your-project
```

## 2️⃣ Install Dependencies

``` bash
npm install
```

------------------------------------------------------------------------

# 🔐 Environment Variables

Create a `.env` file in the root directory:

    PORT=3000
    MONGODB_URI=mongodb://localhost:27017/myapp
    JWT_SECRET=your-super-secret-jwt-key
    LOG_PROFILE=info

⚠️ Never commit `.env` files to version control.

------------------------------------------------------------------------

# ▶️ Running the Application

## Development Mode

``` bash
npm run dev
```

-   Uses ts-node
-   No build step required
-   Ideal for local development

## Development Mode with Verbose Logging

``` bash
npm run dev:verbose
```

## Development Mode with Production-like Logs

``` bash
npm run dev:prodlogs
```

## Production Mode

``` bash
npm run build
npm start
```

------------------------------------------------------------------------

# 🐳 Docker

## Build & Run

``` bash
docker compose up --build
```

Starts: - API container - MongoDB container

## Stop Containers

``` bash
docker compose down
```

------------------------------------------------------------------------

# 📁 Project Structure

    src/
    ├── index.ts
    ├── middleware/
    │   ├── auth.ts
    │   ├── validation.ts
    │   ├── request-logger.ts   
    │   └── error-handler.ts
    ├── mongodb/
    │   ├── db.ts
    │   ├── db-adapter.ts
    │   └── mock-db.ts
    ├── models/
    │   └── user.model.ts
    ├── routes/
    │   ├── index.ts
    │   ├── hello.ts
    │   └── user.ts
    ├── services/
    │   └── user.service.ts
    ├── controllers/
    │   └── user.controller.ts
    ├── utils/
    │   ├── logger.ts
    │   └── password.ts
    ├── config/
    │   └── logging.ts
    ├── schemas/
    │   └── user.schema.ts
    └── mappers/
        └── user.mapper.ts

------------------------------------------------------------------------

# 🌐 API Endpoints

## 🔑 Authentication

-   POST /auth/register
-   POST /auth/login

Response:

``` json
{
  "token": "your-jwt-token"
}
```

## 👤 Users

| Method | Endpoint     | Description        |
|--------|-------------|-------------------|
| GET    | /users      | Get all users     |
| GET    | /users/:id  | Get user by ID    |
| PUT    | /users/:id  | Update user       |
| DELETE | /users/:id  | Delete user       |

## 👋 Health

-   GET /health

------------------------------------------------------------------------

# 🔐 Authentication Usage

Protected routes require:

    Authorization: Bearer <your-token>

------------------------------------------------------------------------

# 🧪 Testing

``` bash
npm test
npm run test:watch
```

------------------------------------------------------------------------

# 📜 Available Scripts

| Script         | Description               |
|---------------|--------------------------|
| build         | Compile TypeScript       |
| start         | Run compiled code        |
| dev           | Development mode         |
| dev:verbose   | Verbose logging          |
| dev:prodlogs  | Production-style logs    |
| test          | Run tests                |
| test:watch    | Watch mode               |
| clean         | Remove dist folder       |
| docker:build  | Build Docker image       |
| docker:up     | Start containers         |
| docker:down   | Stop containers          |

------------------------------------------------------------------------

# 🚀 Deployment Notes

For production:

-   Use managed MongoDB
-   Set strong JWT_SECRET
-   Enable HTTPS
-   Use Docker or process manager
-   Set NODE_ENV=production
-   Set LOG_PROFILE=prod

------------------------------------------------------------------------

# 🤝 Contributing

1.  Fork the repository
2.  Create feature branch
3.  Commit changes
4.  Push branch
5.  Open Pull Request

------------------------------------------------------------------------

# 📄 License

This project is licensed under the MIT License.