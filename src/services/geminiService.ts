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
  }
};
