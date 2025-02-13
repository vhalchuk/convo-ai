# Convo AI

Convo AI is an open-source project that lets you run a custom ChatGPT locally using the OpenAI API — only paying for what you use. It consists of two main parts:

- **Python Server:** Handles API interactions and backend logic.
- **React Client:** Provides a chat interface for interacting with the server.

## Features

- **Local Deployment:** Run the entire setup using Docker.
- **Live Reloading:** Automatically reloads code on changes.
- **Offline Data Storage:** Conversations are stored in the browser using IndexedDB.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (includes Docker Compose)

## Setup Instructions

1. **Clone the Repository**

    ```bash
    git clone https://github.com/yourusername/convo-ai.git
    cd convo-ai
    ```


2. **Configure Environment Variables**

- For the server:

    ```bash
    cp server/.env.example server/.env
    ```
  
- For the client:

    ```bash
    cp client/.env.example client/.env 
    ```
  
    Update both .env files with the necessary keys as provided.

3. **Start the Project**

- Run the following command from the project root:

    ```bash
    cp client/.env.example client/.env 
    ```
  
    This builds and starts both the server and client containers. Logs for each service will be clearly labeled.

## License

This project is licensed under the MIT License.