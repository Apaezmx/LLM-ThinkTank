<div align="center">
  <img alt="LLM ThinkTank Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" width="1200" height="475" />
  <h1>LLM ThinkTank</h1>
  <p><strong>Orchestrate, witness, and analyze dynamic multi-agent AI debates.</strong></p>

  <p>
    <a href="#-core-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-how-to-contribute">Contribute</a>
  </p>
</div>

---

**LLM ThinkTank** is a full-stack application that provides a sandbox for creating, managing, and launching multi-agent debates powered by the Gemini API. Define unique personas and instructions for multiple AI agents and watch them engage in sophisticated, nuanced conversations on any topic you choose.

This tool is perfect for researchers, developers, and hobbyists interested in exploring the emergent behaviors, conversational dynamics, and reasoning capabilities of large language models in a multi-agent setting.

<div align="center">
  <!-- TODO: Replace with an actual screenshot or GIF of the application -->
  <img alt="LLM ThinkTank Application Screenshot" src="https://i.imgur.com/07xVd2E.png" />
  <p><em>A debate in session within the Debate Arena.</em></p>
</div>

## ✨ Core Features

-   **🤖 Agent Creation & Editing:** Easily create, customize, and update AI agents. Define their name, avatar, color, background context, and specific prompts.
-   **⚡️ Multiple Debate Modes:**
    -   **Real-time:** Agents autonomously debate each other.
    -   **Synchronous:** A turn-based mode where you can moderate and advance the debate step-by-step.
-   **⚖️ AI Moderator:** In real-time debates, an AI moderator can be assigned a "halting prompt" to analyze the conversation and stop the debate when a specific condition is met.
-   **💬 Interactive Debate Arena:** A clean, chat-style interface to view the live debate transcript as it unfolds.
-   **📂 Session Management:** All debate sessions are saved, allowing you to review past conversations and outcomes.
-   **🔑 Secure API Key Handling:** Your Gemini API key is stored securely in your browser's local storage.
-   **🛠️ Full-Stack TypeScript:** A modern, type-safe codebase built with React, Node.js, and Express.
-   **🗃️ Persistent Storage:** Uses SQLite for straightforward, file-based storage of all your agents and sessions.

## 🚀 Tech Stack

-   **Frontend:** React, Vite, TypeScript, Tailwind CSS
-   **Backend:** Node.js, Express.js, `tsx`
-   **Database:** `better-sqlite3` (SQLite)
-   **AI:** Google Gemini API (`@google/genai`)
-   **UI Components:** `lucide-react` for icons, `clsx` & `tailwind-merge` for styling.

## 🏁 Getting Started

Follow these instructions to get LLM ThinkTank running on your local machine.

### Prerequisites

-   Node.js (v18 or higher recommended)
-   npm (or yarn/pnpm)
-   A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/llm-thinktank.git
    cd llm-thinktank
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up your API Key:**
    The application loads the API key from the frontend. When you first launch the app, you will be prompted to enter your Gemini API key. It will be stored in your browser's local storage for subsequent sessions.

### Running the Application

Start the development server, which includes both the Express backend and the Vite frontend:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Available Scripts

-   `npm run dev`: Starts the backend and frontend development servers.
-   `npm run build`: Builds the React frontend for production.
-   `npm run preview`: Serves the production build locally.
-   `npm run lint`: Runs the TypeScript compiler to check for type errors.
-   `npm run clean`: Removes the `dist` directory.

## 📁 Project Structure

```
.
├── server.ts               # Express backend server
├── thinktank.db            # SQLite database file
├── src/
│   ├── App.tsx             # Main React application component
│   ├── db.ts               # Database initialization and queries
│   ├── types.ts            # TypeScript type definitions
│   ├── components/         # React components (AgentForm, DebateArena)
│   └── lib/
│       ├── api.ts          # Client-side functions for API calls
│       └── gemini.ts       # Logic for interacting with the Gemini API
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json            # Project dependencies and scripts
```

## 🤝 How to Contribute

Contributions are welcome! Whether it's adding a new feature, fixing a bug, or improving documentation, your help is appreciated.

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix:
    ```bash
    git checkout -b feature/my-awesome-feature
    ```
3.  **Make your changes** and commit them with a clear message.
4.  **Push your branch** to your fork:
    ```bash
    git push origin feature/my-awesome-feature
    ```
5.  **Open a Pull Request** against the `main` branch of this repository.

