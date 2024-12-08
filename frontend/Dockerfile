# Step 1: Use a Node.js image for building the app
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock to install dependencies
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application code
COPY . .

ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID

# Build the application
RUN yarn build

# Step 2: Use an nginx image to serve the built files
FROM nginx:alpine

# Remove the default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy a custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d

# Copy built application files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the application port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
