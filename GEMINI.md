## Project Overview

This project is a full-stack TypeScript application called "LLM ThinkTank". It serves as a tool to orchestrate multi-agent debates powered by the Gemini API. Users can create different AI "agents", each with a unique persona (name, context, prompt, model, etc.), and then pit them against each other in debate "sessions".

The application consists of:
-   A **React frontend** built with Vite, TypeScript, and Tailwind CSS for the UI. It provides components for creating agents, starting and viewing debate sessions.
-   A **Node.js/Express backend** (`server.ts`) that serves a REST API for managing agents, sessions, and messages.
-   A **SQLite database** (`thinktank.db`) for persisting all data, managed by the `better-sqlite3` library.
-   Integration with the **Google Gemini API** (`@google/genai`) to generate responses for each agent based on its persona and the ongoing conversation transcript.

## Building and Running

The project uses `npm` for package management and `tsx` to run the TypeScript server directly.

-   **Install dependencies:**
    ```bash
    npm install
    ```

-   **Set up environment variables:**
    Create a `.env.local` file in the root directory and add your Gemini API key:
    ```
    GEMINI_API_KEY=your_api_key_here
    ```

-   **Run the development server:**
    This command starts the Express backend and the Vite development server. The application will be available at `http://localhost:3000`.
    ```bash
    npm run dev
    ```

-   **Build for production:**
    This command compiles the React frontend into the `dist/` directory.
    ```bash
    npm run build
    ```

-   **Lint the code:**
    This command runs the TypeScript compiler to check for type errors.
    ```bash
    npm run lint
    ```

-   **Preview the production build:**
    This command serves the production build from the `dist/` directory. Note that this does not run the backend server.
    ```bash
    npm run preview
    ```

## Development Conventions

-   **Full-stack TypeScript:** The entire codebase, both frontend and backend, is written in TypeScript.
-   **Component-Based UI:** The frontend is built with React, following a component-based architecture. Core components are located in `src/components/`.
-   **REST API:** The client and server communicate via a RESTful API defined in `server.ts`. The client-side API calls are neatly organized in `src/lib/api.ts`.
-   **Database Abstraction:** All direct database interactions are handled in `src/db.ts`, providing a clear separation of concerns.
-   **Styling:** The project uses Tailwind CSS for styling.
