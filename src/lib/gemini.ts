import { GoogleGenAI } from "@google/genai";
import { Agent, Message } from "../types";

const getAI = (apiKey: string) => new GoogleGenAI({ apiKey });

export async function generateAgentResponse(
  agent: Agent,
  history: Message[],
  allAgents: Agent[],
  topic: string,
  apiKey: string
): Promise<string> {
  const ai = getAI(apiKey);
  
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

export async function generateModeratorResponse(
  history: Message[],
  haltingPrompt: string,
  apiKey: string
): Promise<string> {
  const ai = getAI(apiKey);
  
  const systemInstruction = `
    You are a debate moderator. Your role is to determine if the debate should end based on a specific condition.
    The condition is: "${haltingPrompt}".
    Review the debate transcript. If the condition is met, respond with only the word "HALT".
    Otherwise, respond with "CONTINUE: [brief reason for continuing]".
  `;

  const transcript = history.map(m => `${m.role}: ${m.content}`).join('\n');

  const prompt = `
    Debate Transcript:
    ${transcript}
    
    Condition: "${haltingPrompt}"
    Based on the transcript and the condition, should the debate end? If not, provide a very brief reason why.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    return response.text?.trim() || "CONTINUE: No clear halting condition met yet.";
  } catch (error) {
    console.error("Error generating moderator response:", error);
    return "CONTINUE: Moderator encountered an error.";
  }
}
