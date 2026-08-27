# Multi-stage build for production
FROM node:lts-trixie-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

ARG VITE_SITE_URL=
ENV VITE_SITE_URL=$VITE_SITE_URL

# Build the application
RUN npm run build

# Production stage
FROM node:lts-trixie-slim AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"] 