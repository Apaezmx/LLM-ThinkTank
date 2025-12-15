import Database from 'better-sqlite3';

const db = new Database('thinktank.db');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      context TEXT,
      prompt TEXT,
      model TEXT,
      avatar TEXT,
      color TEXT,
      max_words INTEGER DEFAULT 100
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      mode TEXT,
      halting_prompt TEXT
    );

    CREATE TABLE IF NOT EXISTS session_agents (
      session_id INTEGER,
      agent_id INTEGER,
      FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE,
      FOREIGN KEY(agent_id) REFERENCES agents(id) ON DELETE CASCADE,
      PRIMARY KEY (session_id, agent_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER,
      agent_id INTEGER,
      role TEXT,
      content TEXT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE,
      FOREIGN KEY(agent_id) REFERENCES agents(id) ON DELETE CASCADE
    );
  `);
}

export const getAgents = () => db.prepare('SELECT * FROM agents').all();
export const getAgent = (id: number) => db.prepare('SELECT * FROM agents WHERE id = ?').get(id);
export const createAgent = (agent: any) => {
  const stmt = db.prepare('INSERT INTO agents (name, context, prompt, model, avatar, color, max_words) VALUES (@name, @context, @prompt, @model, @avatar, @color, @max_words)');
  return stmt.run({ max_words: 100, ...agent });
};
export const updateAgent = (id: number, agent: any) => {
  const stmt = db.prepare('UPDATE agents SET name = @name, context = @context, prompt = @prompt, model = @model, avatar = @avatar, color = @color, max_words = @max_words WHERE id = @id');
  return stmt.run({ ...agent, id });
};
export const deleteAgent = (id: number) => db.prepare('DELETE FROM agents WHERE id = ?').run(id);

export const getSessions = () => db.prepare('SELECT * FROM sessions ORDER BY created_at DESC').all();
export const getSession = (id: number) => {
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id);
  if (!session) return null;
  const agents = db.prepare(`
    SELECT a.* FROM agents a
    JOIN session_agents sa ON a.id = sa.agent_id
    WHERE sa.session_id = ?
  `).all(id);
  const messages = db.prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC').all(id);
  return { ...session, agents, messages };
};
export const createSession = (name: string, mode: string, agentIds: number[], haltingPrompt: string) => {
  const result = db.prepare('INSERT INTO sessions (name, mode, halting_prompt) VALUES (?, ?, ?)').run(name, mode, haltingPrompt);
  const sessionId = result.lastInsertRowid;
  const insertAgent = db.prepare('INSERT INTO session_agents (session_id, agent_id) VALUES (?, ?)');
  agentIds.forEach(agentId => insertAgent.run(sessionId, agentId));
  return sessionId;
};
export const addMessage = (sessionId: number, agentId: number | null, role: string, content: string) => {
  return db.prepare('INSERT INTO messages (session_id, agent_id, role, content) VALUES (?, ?, ?, ?)').run(sessionId, agentId, role, content);
};

export default db;
