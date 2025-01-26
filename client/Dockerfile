# Base image for Node.js
FROM node:22-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and pnpm-lock.yaml for dependency installation
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Expose the development server port
EXPOSE 5173

# Start the Vite development server
CMD ["pnpm", "run", "dev", "--", "--host", "0.0.0.0"]
