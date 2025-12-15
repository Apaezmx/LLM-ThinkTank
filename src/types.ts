export interface Agent {
  id: number;
  name: string;
  context: string;
  prompt: string;
  model: string;
  avatar: string;
  color: string;
  max_words?: number;
}

export interface Session {
  id: number;
  name: string;
  mode: 'realtime' | 'synchronous';
  created_at: string;
  agents: Agent[];
  messages: Message[];
}

export interface Message {
  id?: number;
  session_id: number;
  agent_id: number | null;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp?: string;
}
