import React, { useState, useEffect, useRef } from 'react';
import { Session, Agent, Message } from '../types';
import { api } from '../lib/api';
import { generateAgentResponse } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';
import { Play, Pause, SkipForward, Send, StopCircle } from 'lucide-react';
import clsx from 'clsx';

interface DebateArenaProps {
  session: Session;
  onUpdate: () => void;
}

export const DebateArena: React.FC<DebateArenaProps> = ({ session, onUpdate }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [thinkingAgents, setThinkingAgents] = useState<Set<number>>(new Set());
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages]);

  // Real-time loop
  useEffect(() => {
    if (!isRunning || session.mode !== 'realtime') return;

    const interval = setInterval(() => {
      // Check if we should trigger an agent
      // If no one is thinking and it's been a while, or just randomly
      if (thinkingAgents.size === 0) {
        // Pick a random agent that isn't the last speaker
        const lastMsg = session.messages[session.messages.length - 1];
        const candidates = session.agents.filter(a => a.id !== lastMsg?.agent_id);
        
        if (candidates.length > 0) {
          const nextAgent = candidates[Math.floor(Math.random() * candidates.length)];
          triggerAgent(nextAgent);
        }
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, [isRunning, session, thinkingAgents]);

  const triggerAgent = async (agent: Agent) => {
    if (thinkingAgents.has(agent.id)) return;

    setThinkingAgents(prev => new Set(prev).add(agent.id));
    
    try {
      const response = await generateAgentResponse(agent, session.messages, session.agents, session.name);
      await api.addMessage(session.id, agent.id, 'model', response);
      onUpdate();
    } catch (err) {
      console.error(err);
    } finally {
      setThinkingAgents(prev => {
        const next = new Set(prev);
        next.delete(agent.id);
        return next;
      });
    }
  };

  const handleStart = () => {
    setIsRunning(true);
    // If no messages, maybe trigger the first agent?
    if (session.messages.length === 0 && session.agents.length > 0) {
       triggerAgent(session.agents[0]);
    }
  };

  const handleStop = () => setIsRunning(false);

  const handleNextStep = () => {
    // Synchronous: Pick next agent in round-robin or random
    const lastMsg = session.messages[session.messages.length - 1];
    let nextAgent = session.agents[0];
    
    if (lastMsg?.agent_id) {
      const idx = session.agents.findIndex(a => a.id === lastMsg.agent_id);
      nextAgent = session.agents[(idx + 1) % session.agents.length];
    }
    
    triggerAgent(nextAgent);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    await api.addMessage(session.id, null, 'user', input);
    setInput('');
    onUpdate();
    
    // If realtime, this might trigger responses via the effect
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">{session.name}</h2>
          <p className="text-sm text-gray-500">Mode: {session.mode} | Agents: {session.agents.length}</p>
        </div>
        <div className="flex gap-2">
          {session.mode === 'realtime' ? (
            !isRunning ? (
              <button onClick={handleStart} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                <Play size={18} /> Start Debate
              </button>
            ) : (
              <button onClick={handleStop} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                <Pause size={18} /> Pause
              </button>
            )
          ) : (
            <button onClick={handleNextStep} disabled={thinkingAgents.size > 0} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
              <SkipForward size={18} /> Next Turn
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {session.messages.map((msg, idx) => {
          const agent = session.agents.find(a => a.id === msg.agent_id);
          const isUser = msg.role === 'user';
          
          return (
            <div key={idx} className={clsx("flex gap-3", isUser ? "justify-end" : "justify-start")}>
              {!isUser && (
                <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0", agent?.color || 'bg-gray-300')}>
                  {agent?.avatar}
                </div>
              )}
              
              <div className={clsx(
                "max-w-[80%] rounded-lg p-4 shadow-sm",
                isUser ? "bg-blue-600 text-white" : "bg-white border border-gray-200"
              )}>
                {!isUser && <div className="text-xs font-bold text-gray-500 mb-1">{agent?.name}</div>}
                <div className="markdown-body text-sm">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>

              {isUser && (
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white shrink-0">
                  👤
                </div>
              )}
            </div>
          );
        })}
        
        {/* Thinking Indicators */}
        {Array.from(thinkingAgents).map(agentId => {
          const agent = session.agents.find(a => a.id === agentId);
          return (
            <div key={`thinking-${agentId}`} className="flex gap-3 animate-pulse">
              <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center text-xl", agent?.color)}>
                {agent?.avatar}
              </div>
              <div className="bg-gray-100 rounded-lg p-3 text-gray-500 text-sm italic">
                {agent?.name} is thinking...
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleUserSubmit} className="p-4 bg-white border-t flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Interject or add context..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-black text-white p-2 rounded-lg hover:bg-gray-800">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};
