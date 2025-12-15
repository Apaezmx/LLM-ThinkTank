import React, { useState } from 'react';
import { Agent } from '../types';
import { X } from 'lucide-react';

interface AgentFormProps {
  initialData?: Partial<Agent>;
  onSubmit: (agent: Omit<Agent, 'id'>) => void;
  onCancel: () => void;
}

export const AgentForm: React.FC<AgentFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    context: initialData?.context || '',
    prompt: initialData?.prompt || '',
    model: initialData?.model || 'gemini-2.5-flash',
    avatar: initialData?.avatar || '🤖',
    color: initialData?.color || 'bg-blue-500',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">Configure Agent</h3>
        <button type="button" onClick={onCancel}><X size={20} /></button>
      </div>
      
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className="w-full border rounded p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Context (Who are they?)</label>
        <textarea
          value={formData.context}
          onChange={e => setFormData({ ...formData, context: e.target.value })}
          className="w-full border rounded p-2 h-20"
          placeholder="e.g. You are a skeptical scientist..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Prompt (Goal/Stance)</label>
        <textarea
          value={formData.prompt}
          onChange={e => setFormData({ ...formData, prompt: e.target.value })}
          className="w-full border rounded p-2 h-20"
          placeholder="e.g. Argue against the motion using data..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Model</label>
        <select
          value={formData.model}
          onChange={e => setFormData({ ...formData, model: e.target.value })}
          className="w-full border rounded p-2"
        >
          <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</option>
          <option value="gemini-3-pro-preview">Gemini 3 Pro (Reasoning)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Max Words</label>
        <input
          type="number"
          value={formData.max_words || 100}
          onChange={e => setFormData({ ...formData, max_words: parseInt(e.target.value) })}
          className="w-full border rounded p-2"
          min={10}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium">Avatar Emoji</label>
          <input
            type="text"
            value={formData.avatar}
            onChange={e => setFormData({ ...formData, avatar: e.target.value })}
            className="w-full border rounded p-2"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium">Color</label>
          <select
            value={formData.color}
            onChange={e => setFormData({ ...formData, color: e.target.value })}
            className="w-full border rounded p-2"
          >
            <option value="bg-blue-500">Blue</option>
            <option value="bg-red-500">Red</option>
            <option value="bg-green-500">Green</option>
            <option value="bg-yellow-500">Yellow</option>
            <option value="bg-purple-500">Purple</option>
            <option value="bg-pink-500">Pink</option>
            <option value="bg-indigo-500">Indigo</option>
            <option value="bg-gray-500">Gray</option>
          </select>
        </div>
      </div>

      <button type="submit" className="w-full bg-black text-white p-2 rounded hover:bg-gray-800">
        Save Agent
      </button>
    </form>
  );
};
