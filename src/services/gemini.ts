import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const MODEL_NAME = "gemini-3-flash-preview";

export async function getTaskRecommendations(userProfile: any, availableTasks: any[]) {
  const prompt = `
    User Profile:
    - Skills: ${userProfile.skills?.join(', ')}
    - Interests: ${userProfile.interests?.join(', ')}
    
    Available Tasks:
    ${JSON.stringify(availableTasks.map(t => ({ id: t._id, title: t.title, description: t.description, skills: t.requiredSkills })))}
    
    Recommend the top 5 tasks for this user.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: "You are an AI career and task matching specialist. Return a JSON array of recommendation objects. Each object must have: taskId, matchPercentage (number), and reason (string).",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            taskId: { type: Type.STRING },
            matchPercentage: { type: Type.NUMBER },
            reason: { type: Type.STRING }
          },
          required: ["taskId", "matchPercentage", "reason"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
}

export async function suggestSkillRecycling(skills: string[]) {
  const prompt = `My skills: ${skills.join(', ')}. Suggest 5 creative ways I can use these skills for social impact or micro-tasks.`;
  
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: "You are a creative skill consultant. Return a JSON array of strings.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  return JSON.parse(response.text || '[]');
}

export async function generateTask(goal: string) {
  const prompt = `Create a task for the goal: ${goal}`;
  
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: "Generate a task specification. Return JSON with: title, description, skills (array), duration, impactLevel ('Low', 'Medium', 'High').",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          skills: { type: Type.ARRAY, items: { type: Type.STRING } },
          duration: { type: Type.STRING },
          impactLevel: { type: Type.STRING }
        },
        required: ["title", "description", "skills", "duration", "impactLevel"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

export async function enhanceDescription(description: string) {
  const prompt = `Enhance this task description to be more engaging and clear: ${description}`;
  
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: "You are a professional editor. Return just the enhanced description text.",
    }
  });

  return response.text?.trim() || description;
}
