#!/bin/bash

# Configuration
CONTAINER_NAME="react-client-container"
IMAGE_NAME="react-client"
CLIENT_PORT=5173
HOST_DIR="$(pwd)/client"
CONTAINER_DIR="/app"

# Build the Docker image
echo "Building the React client Docker image..."
docker build -t ${IMAGE_NAME} ${HOST_DIR}

# Run the container
echo "Starting the React client..."
docker run --rm -it \
  -v "${HOST_DIR}:${CONTAINER_DIR}" \
  -v "${CONTAINER_DIR}/node_modules" \
  -p ${CLIENT_PORT}:${CLIENT_PORT} \
  --name ${CONTAINER_NAME} \
  ${IMAGE_NAME}
