# Convo AI

Convo AI is an open-source project that lets you run a custom ChatGPT locally using own OpenAI API key. It consists of two main parts:

- **NodeJS Server:** Handles API interactions and backend logic.
- **React Client:** Provides a chat interface for interacting with the server.

## Tech Stack

### Server

- Node.js
- Express
- TypeScript
- OpenAI API
- Vercel Serverless Functions

### Client

- React
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI

### Testing

- Playwright (E2E)

## Features

- **Live Reloading:** Automatically reloads code on changes.
- **Offline Data Storage:** Conversations are stored in the browser using IndexedDB.
- **Modern UI:** Built with Tailwind CSS and Shadcn UI components.
- **Type Safety:** Full TypeScript support across the stack.
- **E2E Testing:** Comprehensive end-to-end tests using Playwright.
- **Serverless Deployment:** API routes deployed as Vercel serverless functions.

## Prerequisites

- [pnpm](https://pnpm.io/installation)
- Node.js (v20 or higher)
- OpenAI API key

## Setup Instructions

1. **Clone the Repository**

    ```bash
    git clone https://github.com/vhalchuk/convo-ai.git
    cd convo-ai
    ```

2. **Configure Environment Variables**

- For the server (`apps/server/.env`):

    ```
    OPENAI_API_KEY=your_openai_api_key
    PORT=3000
    ```

- For the client (`apps/client/.env`):
    ```
    VITE_API_URL=http://localhost:3000
    ```

3. **Install Dependencies**

    ```bash
    pnpm install
    ```

4. **Start the Project**

    ```bash
    pnpm run dev
    ```

## Development Workflow

1. The project uses a monorepo structure with pnpm workspaces
2. Client and server code are in separate packages under `apps/`
3. Shared code is in the `packages/` directory
4. Changes to shared code will automatically trigger rebuilds of dependent packages
5. API routes are implemented as Vercel serverless functions in the `api/` directory
6. E2E tests are located in `apps/client/e2e/` directory

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
