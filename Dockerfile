# Use an official Node.js image as a base image to install bun
FROM node:18 AS builder

WORKDIR /app

# Install Bun globally
RUN curl -fsSL https://bun.sh/install | bash

# Add Bun binary to the PATH
ENV PATH="/root/.bun/bin:${PATH}"

# Copy package.json and bun.lockb (if it exists)
COPY package.json ./

# Install dependencies
RUN bun install

# Copy the rest of the application
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN bun run build:prod

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]