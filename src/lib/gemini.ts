import { GoogleGenAI } from "@google/genai";
import { Agent, Message } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateAgentResponse(
  agent: Agent,
  history: Message[],
  allAgents: Agent[],
  topic: string
): Promise<string> {
  const ai = getAI();
  
  const systemInstruction = `
    You are ${agent.name}.
    Context: ${agent.context}
    Your Personal Goal/Prompt: ${agent.prompt}
    
    You are participating in a debate on the topic: "${topic}".
    Keep your response under ${agent.max_words || 100} words unless specified otherwise.
    Engage with other participants.
  `;

  const agentMap = new Map(allAgents.map(a => [a.id, a.name]));

  const transcript = history.map(m => {
    let speaker = 'Moderator';
    if (m.agent_id) {
      speaker = agentMap.get(m.agent_id) || `Agent ${m.agent_id}`;
    } else if (m.role === 'user') {
      speaker = 'User';
    }
    return `${speaker}: ${m.content}`;
  }).join('\n');

  const prompt = `
    The current debate transcript is:
    ${transcript}
    
    Respond to the latest developments based on your persona.
  `;

  try {
    const response = await ai.models.generateContent({
      model: agent.model || 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
      }
    });
    return response.text || "I have nothing to add right now.";
  } catch (error) {
    console.error("Error generating response:", error);
    return "I am having trouble thinking right now.";
  }
}
