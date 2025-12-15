import express from "express";
import { createServer as createViteServer } from "vite";
import { initDb, getAgents, createAgent, updateAgent, deleteAgent, getSessions, createSession, getSession, addMessage } from "./src/db";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize DB
  initDb();

  // API Routes
  app.get("/api/agents", (req, res) => {
    res.json(getAgents());
  });

  app.post("/api/agents", (req, res) => {
    try {
      const result = createAgent(req.body);
      res.json({ id: result.lastInsertRowid, ...req.body });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/agents/:id", (req, res) => {
    try {
      updateAgent(Number(req.params.id), req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/agents/:id", (req, res) => {
    try {
      deleteAgent(Number(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/sessions", (req, res) => {
    res.json(getSessions());
  });

  app.post("/api/sessions", (req, res) => {
    try {
      const { name, mode, agentIds } = req.body;
      const id = createSession(name, mode, agentIds);
      res.json({ id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/sessions/:id", (req, res) => {
    const session = getSession(Number(req.params.id));
    if (session) res.json(session);
    else res.status(404).json({ error: "Session not found" });
  });

  app.post("/api/sessions/:id/messages", (req, res) => {
    try {
      const { agentId, role, content } = req.body;
      addMessage(Number(req.params.id), agentId, role, content);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
