import { Agent, Session, Message } from '../types';

export const api = {
  getAgents: async (): Promise<Agent[]> => {
    const res = await fetch('/api/agents');
    return res.json();
  },
  createAgent: async (agent: Omit<Agent, 'id'>): Promise<Agent> => {
    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agent),
    });
    return res.json();
  },
  updateAgent: async (id: number, agent: Omit<Agent, 'id'>): Promise<void> => {
    await fetch(`/api/agents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agent),
    });
  },
  deleteAgent: async (id: number): Promise<void> => {
    await fetch(`/api/agents/${id}`, { method: 'DELETE' });
  },
  getSessions: async (): Promise<Session[]> => {
    const res = await fetch('/api/sessions');
    return res.json();
  },
  getSession: async (id: number): Promise<Session> => {
    const res = await fetch(`/api/sessions/${id}`);
    if (!res.ok) throw new Error('Session not found');
    return res.json();
  },
  createSession: async (name: string, mode: string, agentIds: number[], haltingPrompt: string): Promise<{ id: number }> => {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, mode, agentIds, haltingPrompt }),
    });
    return res.json();
  },
  addMessage: async (sessionId: number, agentId: number | null, role: string, content: string): Promise<void> => {
    await fetch(`/api/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentId, role, content }),
    });
  },
};
