import React, { useState, useEffect } from 'react';
import { Agent, Session } from './types';
import { api } from './lib/api';
import { AgentForm } from './components/AgentForm';
import { DebateArena } from './components/DebateArena';
import clsx from 'clsx';
import { Plus, Trash2, MessageSquare, Users, PlayCircle, KeyRound } from 'lucide-react';

function App() {
  const [view, setView] = useState<'home' | 'session'>('home');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiModal, setShowApiModal] = useState(false);
  
  // New Session State
  const [newSessionName, setNewSessionName] = useState('');
  const [newSessionMode, setNewSessionMode] = useState<'realtime' | 'synchronous'>('realtime');
  const [selectedAgentIds, setSelectedAgentIds] = useState<number[]>([]);
  const [haltingPrompt, setHaltingPrompt] = useState('');

  useEffect(() => {
    loadData();
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    } else {
      setShowApiModal(true);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    setShowApiModal(false);
  };

  const loadData = async () => {
    try {
      const [agentsData, sessionsData] = await Promise.all([
        api.getAgents(),
        api.getSessions()
      ]);
      setAgents(agentsData);
      setSessions(sessionsData);
    } catch (e) {
      console.error("Failed to load data", e);
    }
  };

  const handleCreateAgent = async (agent: Omit<Agent, 'id'>) => {
    await api.createAgent(agent);
    setShowAgentForm(false);
    loadData();
  };

  const handleUpdateAgent = async (id: number, agent: Omit<Agent, 'id'>) => {
    await api.updateAgent(id, agent);
    setEditingAgent(null);
    setShowAgentForm(false);
    loadData();
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setShowAgentForm(true);
  };

  const handleDeleteAgent = async (id: number) => {
    if (confirm('Are you sure?')) {
      await api.deleteAgent(id);
      loadData();
    }
  };

  const handleCreateSession = async () => {
    if (!newSessionName || selectedAgentIds.length === 0) return;
    const { id } = await api.createSession(newSessionName, newSessionMode, selectedAgentIds, haltingPrompt);
    const session = await api.getSession(id);
    setActiveSession(session);
    setView('session');
    // Reset form
    setNewSessionName('');
    setSelectedAgentIds([]);
    setHaltingPrompt('');
    loadData();
  };

  const handleOpenSession = async (id: number) => {
    if (!apiKey) {
      setShowApiModal(true);
      return;
    }
    const session = await api.getSession(id);
    setActiveSession(session);
    setView('session');
  };

  const refreshActiveSession = async () => {
    if (activeSession) {
      const updated = await api.getSession(activeSession.id);
      setActiveSession(updated);
    }
  };

  if (view === 'session' && activeSession) {
    return (
      <div className="h-screen flex flex-col">
        <div className="bg-black text-white p-2 flex justify-between items-center">
          <button onClick={() => setView('home')} className="text-sm hover:underline">← Back to Dashboard</button>
          <h1 className="font-bold">LLM ThinkTank</h1>
          <div />
        </div>
        <div className="flex-1 overflow-hidden">
          <DebateArena 
            session={activeSession} 
            onUpdate={refreshActiveSession} 
            apiKey={apiKey} 
            haltingPrompt={activeSession.halting_prompt}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {showApiModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 space-y-4 w-full max-w-md">
            <h2 className="text-xl font-bold">Enter your Gemini API Key</h2>
            <p className="text-sm text-gray-600">
              You can get your key from Google AI Studio. The key will be saved in your browser's local storage.
            </p>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveApiKey(e.currentTarget.apiKey.value);
            }}>
              <input
                type="password"
                name="apiKey"
                defaultValue={apiKey}
                className="w-full border rounded p-2"
                placeholder="Enter your API key"
              />
              <div className="flex justify-end gap-2 mt-4">
                 <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">
                  Save Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tight">LLM ThinkTank</h1>
            <p className="text-gray-500">Orchestrate multi-agent debates with ease.</p>
          </div>
          <button onClick={() => setShowApiModal(true)} className="flex items-center gap-2 text-sm bg-white border rounded-lg px-3 py-2 hover:bg-gray-50">
            <KeyRound size={16} /> Set API Key
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Agents */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2"><Users /> Agents</h2>
              <button onClick={() => setShowAgentForm(true)} className="bg-black text-white p-2 rounded-full hover:bg-gray-800"><Plus size={16} /></button>
            </div>
            
            {showAgentForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="w-full max-w-md">
                  <AgentForm 
                    initialData={editingAgent || {}}
                    onSubmit={(agent) => {
                      if (editingAgent) {
                        handleUpdateAgent(editingAgent.id, agent);
                      } else {
                        handleCreateAgent(agent);
                      }
                    }} 
                    onCancel={() => {
                      setShowAgentForm(false);
                      setEditingAgent(null);
                    }} 
                  />
                </div>
              </div>
            )}

            <div className="grid gap-3">
              {agents.map(agent => (
                <div key={agent.id} className="bg-white rounded-lg shadow-sm border border-gray-100 flex justify-between items-start group cursor-pointer">
                  <button onClick={() => handleEditAgent(agent)} className="flex gap-3 text-left w-full p-4">
                    <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0", agent.color)}>
                      {agent.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold">{agent.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2">{agent.context}</p>
                    </div>
                  </button>
                  <button onClick={() => handleDeleteAgent(agent.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-4">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {agents.length === 0 && <p className="text-gray-400 italic">No agents created yet.</p>}
            </div>
          </div>

          {/* Middle Column: New Session */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><PlayCircle /> New Session</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Topic / Session Name</label>
                <input
                  type="text"
                  value={newSessionName}
                  onChange={e => setNewSessionName(e.target.value)}
                  className="w-full border rounded p-2"
                  placeholder="e.g. Is AI Sentient?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mode</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewSessionMode('realtime')}
                    className={clsx("flex-1 py-2 rounded border text-sm", newSessionMode === 'realtime' ? "bg-black text-white border-black" : "bg-white text-gray-700")}
                  >
                    Real-time
                  </button>
                  <button
                    onClick={() => setNewSessionMode('synchronous')}
                    className={clsx("flex-1 py-2 rounded border text-sm", newSessionMode === 'synchronous' ? "bg-black text-white border-black" : "bg-white text-gray-700")}
                  >
                    Synchronous
                  </button>
                </div>
              </div>

              {newSessionMode === 'realtime' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Halting Prompt</label>
                  <textarea
                    value={haltingPrompt}
                    onChange={e => setHaltingPrompt(e.target.value)}
                    className="w-full border rounded p-2 h-20"
                    placeholder="e.g. Stop the debate when an agent mentions 'synergy'."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Select Agents (1-8)</label>
                <div className="max-h-48 overflow-y-auto border rounded p-2 space-y-1">
                  {agents.map(agent => (
                    <label key={agent.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAgentIds.includes(agent.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            if (selectedAgentIds.length < 8) {
                              setSelectedAgentIds([...selectedAgentIds, agent.id]);
                            }
                          } else {
                            setSelectedAgentIds(selectedAgentIds.filter(id => id !== agent.id));
                          }
                        }}
                      />
                      <span className={clsx("w-6 h-6 rounded-full flex items-center justify-center text-xs", agent.color)}>{agent.avatar}</span>
                      <span className="text-sm">{agent.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">{selectedAgentIds.length} selected</p>
              </div>

              <button
                onClick={handleCreateSession}
                disabled={!newSessionName || selectedAgentIds.length === 0 || !apiKey}
                className="w-full bg-blue-600 text-white p-3 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                Create Session
              </button>
            </div>
          </div>

          {/* Right Column: Saved Sessions */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><MessageSquare /> Saved Sessions</h2>
            <div className="grid gap-3">
              {sessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => handleOpenSession(session.id)}
                  className="w-full text-left bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-blue-500 transition-colors"
                >
                  <h3 className="font-bold">{session.name}</h3>
                  <p className="text-xs text-gray-500">{new Date(session.created_at).toLocaleDateString()} • {session.mode}</p>
                </button>
              ))}
              {sessions.length === 0 && <p className="text-gray-400 italic">No sessions yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
