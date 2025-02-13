# Convo AI

Convo AI is an open-source project that lets you run a custom ChatGPT locally using own OpenAI API key. It consists of two main parts:

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
    git clone https://github.com/vhalchuk/convo-ai.git
    cd convo-ai
    ```


2. **Configure Environment Variables**

- For the server:

    Open your preferred text editor or file manager and create a copy of `server/.env.example`. Rename the copied file to `.env` (keeping it in the same folder). Then, update the values in the new `.env` file with the keys provided.
  
- For the client:

    Similarly, duplicate the `client/.env.example` file as `.env` in the client folder and fill in the necessary keys.

3. **Start the Project**

- Run the following command from the project root:

    ```bash
    docker-compose up
    ```
  
    This builds and starts both the server and client containers. Logs for each service will be clearly labeled.

## License

This project is licensed under the MIT License.
