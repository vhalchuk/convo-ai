#!/bin/bash

# Configuration
CONTAINER_NAME="python-server-container"
IMAGE_NAME="python-server"
SERVER_PORT=8000
HOST_DIR="$(pwd)/server"
CONTAINER_DIR="/app"

# Build the Docker image
echo "Building the Python server Docker image..."
docker build -t ${IMAGE_NAME} ${HOST_DIR}

# Run the container
echo "Starting the Python server..."
docker run --rm -it \
  -v "${HOST_DIR}:${CONTAINER_DIR}" \
  -p ${SERVER_PORT}:${SERVER_PORT} \
  --name ${CONTAINER_NAME} \
  ${IMAGE_NAME}
