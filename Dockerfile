# ---- build stage ----
FROM node:24-bookworm-slim AS builder
WORKDIR /app

# Install dependencies (including dev deps needed to build TypeScript)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Remove devDependencies so runtime copy is smaller/cleaner
RUN npm prune --omit=dev


# ---- runtime stage ----
FROM node:24-bookworm-slim AS runtime
WORKDIR /app

# Production environment (your app can still use NODE_ENV for DB switching)
ENV NODE_ENV=production
ENV PORT=3000

# Copy only what we need at runtime
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Optional but recommended: run as non-root
USER node

EXPOSE 3000

CMD ["node", "dist/index.js"]