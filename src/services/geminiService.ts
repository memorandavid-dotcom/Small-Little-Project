import { GoogleGenAI, Type } from "@google/genai";
import { Task, TaskStatus, ScheduleItem, SubStep } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiService = {
  async parsePrompt(prompt: string, currentContext: any) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are an AI Time Management Assistant. The user says: "${prompt}"
        Current Time: ${new Date().toISOString()}
        Current Context: ${JSON.stringify(currentContext)}
        
        Analyze the intent and return a JSON object.
        Possible intents: "schedule_day", "task_breakdown", "clear_event", "analyze_time", "query".
        
        CRITICAL: If the user wants to "schedule their day" or "clear an event" but hasn't specified a DATE or TIME, use the "query" intent to ask them for the missing information politely.
        
        If "schedule_day":
        {
          "intent": "schedule_day",
          "data": { 
            "events": [
              { "title": string, "startTime": ISO_STRING, "endTime": ISO_STRING, "type": "work" | "break" | "meeting" | "personal" }
            ]
          }
        }
        
        If "task_breakdown":
        {
          "intent": "task_breakdown",
          "data": { 
            "title": string, 
            "subSteps": string[],
            "suggestion": string,
            "questions": string[] 
          }
        }
        
        If "clear_event":
        {
          "intent": "clear_event",
          "data": { 
            "isWholeDay": boolean, 
            "targetDate": string (YYYY-MM-DD),
            "startTime": ISO_STRING (optional),
            "endTime": ISO_STRING (optional)
          }
        }
        
        If "analyze_time":
        {
          "intent": "analyze_time",
          "data": { 
            "analysis": string,
            "suggestions": string[],
            "qualityScore": number (0-100)
          }
        }
        
        If "query":
        {
          "intent": "query",
          "data": { "answer": string }
        }
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING },
            data: { type: Type.OBJECT }
          },
          required: ["intent", "data"]
        }
      }
    });

    return JSON.parse(response.text);
  },

  async breakdownTask(taskTitle: string): Promise<string[]> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Break down the task "${taskTitle}" into 4-6 manageable, actionable sub-steps. Return as a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    return JSON.parse(response.text);
  },

  async getSupportReply(message: string, chatHistory: { sender: 'user' | 'agent', text: string }[]): Promise<string> {
    try {
      const formattedHistory = chatHistory.map(h => `${h.sender === 'user' ? 'User' : 'Support Agent'}: ${h.text}`).join('\n');
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `
          You are a smart technical support specialist for Chronos AI.
          Chronos AI is an advanced time management, task breakdown, monthly calendar scheduler, and academic hub suite with dynamic GPA scale support.
          
          Answer the following user issue inside the context of Chronos AI. Be polite, helpful, technical, yet easy to understand.
          Do not use long winded greetings. Go straight to providing valuable debugging steps, configuration tips, or feature instructions.
          
          Helpful features of Chronos:
          - Academic Hub: dynamic GPA calculation (A-F grids or 100-0 penalty systems), weighting sliders for quizzes/exam/homework.
          - Tasks: checklists, customizable reminders, material manifests, time estimation.
          - Schedule: Month/Day agenda, Online/Hybrid event options, dynamic AI time blocking proposals.
          - Mail Center & System Settings (timezones, billing rate ledger limits, plan tiers basic/student/pro/business).
          
          Chat History:
          ${formattedHistory}
          
          New User Message: "${message}"
          
          Provide your solution.
        `,
      });
      return response.text || "I apologize. I am currently experiencing connection difficulties. Please verify that your configurations are set correctly, or retry in a moment!";
    } catch (e) {
      console.error(e);
      return "I apologize. I am currently experiencing connection difficulties. Please verify that your configurations are set correctly, or retry in a moment!";
    }
  },

  async getCustomAgentResponse(
    agentName: string,
    promptPrefix: string,
    tone: string,
    userMessage: string,
    chatHistory: { sender: 'user' | 'agent', text: string }[],
    currentContext: any
  ): Promise<string> {
    try {
      const formattedHistory = chatHistory.map(h => `${h.sender === 'user' ? 'User' : agentName}: ${h.text}`).join('\n');
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `
          You are a customized AI agent/bot named "${agentName}" operating inside Chronos AI.
          Chronos AI is an advanced workspace for time management, calendar schedules, task breakdowns, and an academic hub.
          
          Your specific personality/role instructions:
          ${promptPrefix}
          
          Your designated response tone: "${tone}"
          
          Here is the user's workspace context data if you need to reference it:
          - Active Tasks: ${JSON.stringify(currentContext.tasks || [])}
          - Academic Courses: ${JSON.stringify(currentContext.courses || [])}
          - Calendar/Schedule: ${JSON.stringify(currentContext.schedule || [])}
          
          Adhere strictly to your designated persona and tone. Keep your responses engaging, helpful, and direct (avoid long intros).
          
          Chat History:
          ${formattedHistory}
          
          New User Message: "${userMessage}"
          
          Provide your custom response.
        `,
      });
      return response.text || `Hello! I am ${agentName}. I am having trouble connecting right now, but I would love to chat again in a moment!`;
    } catch (e) {
      console.error(e);
      return `Hello! I am ${agentName}. I am having trouble connecting right now, but I would love to chat again in a moment!`;
    }
  }
};
