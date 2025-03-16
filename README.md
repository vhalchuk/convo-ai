# Convo AI

Convo AI is an open-source project that lets you run a custom ChatGPT locally using own OpenAI API key. It consists of two main parts:

- **NodeJS Server:** Handles API interactions and backend logic.
- **React Client:** Provides a chat interface for interacting with the server.

## Features

- **Live Reloading:** Automatically reloads code on changes.
- **Offline Data Storage:** Conversations are stored in the browser using IndexedDB.

## Prerequisites

- [pnpm](https://pnpm.io/installation)

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
    pnpm run dev
    ```

## License

This project is licensed under the MIT License.

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/vhalchuk/convo-ai?utm_source=oss&utm_medium=github&utm_campaign=vhalchuk%2Fconvo-ai&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)
