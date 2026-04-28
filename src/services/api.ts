import { GoogleGenAI } from "@google/genai";
import { 
  getTaskRecommendations, 
  suggestSkillRecycling, 
  generateTask, 
  enhanceDescription 
} from './gemini.ts';

// Re-exporting for easy access
export { 
  getTaskRecommendations, 
  suggestSkillRecycling, 
  generateTask, 
  enhanceDescription 
};

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(endpoint, { ...options, headers });
  
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    if (text.trim().startsWith('<!doctype html>')) {
      throw new Error(`The server returned an HTML page instead of JSON. This often means the API route was not found or the server crashed. Path: ${endpoint}`);
    }
    throw new Error(`Unexpected response from server: ${text.slice(0, 100)}`);
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details ? `${error.error}: ${error.details}` : (error.error || 'Something went wrong'));
  }
  return response.json();
}
