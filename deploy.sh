#!/bin/bash
set -e

# Variables
DEPLOY_DIR="/home/ubuntu/oops"

# Check for required tools
if ! command -v git &> /dev/null || ! command -v docker-compose &> /dev/null; then
  echo "git and docker-compose are required but not installed. Exiting."
  exit 1
fi

# Navigate to the deployment directory
cd "$DEPLOY_DIR"

# Ensure we're on the release branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [ "$current_branch" != "release" ]; then
  echo "Not on release branch. Exiting."
  exit 1
fi

# Stop running containers
echo "Stopping running containers..."
docker-compose down

# Pull the latest changes from the repository
echo "Pulling latest changes from release branch..."
git pull origin release

# Build specific services
echo "Building Docker services..."
docker-compose build backend frontend hasura-apply-metadata init-data

# Start the services in detached mode
echo "Starting Docker services..."
docker-compose up -d

# Check service status
echo "Checking service status..."
docker-compose ps

echo "Deployment complete!"
