import { Injectable, inject } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;
  private settings = inject(SettingsService);

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] });
  }

  async analyzeScene(frameBase64: string, faceBase64: string): Promise<string> {
    const config = this.settings.modelConfig();
    
    // Construct system instruction based on "Safety Level"
    let systemInstruction = 'You are a cinema-grade VFX rendering engine log generator.';
    if (config.systemInstructionLevel === 'strict') {
      systemInstruction += ' Be extremely precise and conservative. Do not halllucinate details.';
    } else if (config.systemInstructionLevel === 'creative') {
      systemInstruction += ' You may infer missing details and estimate highly complex geometry creatively.';
    }

    // Build the generation config dynamically
    const generationConfig: any = {
      responseMimeType: 'application/json',
      temperature: config.temperature,
      topK: config.topK,
      topP: config.topP,
      maxOutputTokens: config.maxOutputTokens
    };

    // Apply Thinking Config if budget > 0 (Only supported on gemini-2.5-flash)
    if (config.thinkingBudget > 0) {
      generationConfig.thinkingConfig = { thinkingBudget: config.thinkingBudget };
    }

    try {
      // Helper to strip data:image/png;base64, prefix if present
      const cleanFrame = frameBase64.split(',')[1] || frameBase64;
      const cleanFace = faceBase64.split(',')[1] || faceBase64;

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { text: `
              ${systemInstruction}
              I will provide two images:
              1. A movie frame with a character selected.
              2. A reference face (identity).

              Analyze these images and output a technical JSON object (do not use markdown code blocks, just raw JSON) with the following structure:
              {
                "lighting": {
                   "type": "string (e.g., 'Diffused Tungsten', 'Harsh Sunlight')",
                   "temperature": "number (Kelvin)",
                   "direction": "string (vector approximation)"
                },
                "geometry": {
                   "match_confidence": "number (0-100)",
                   "poly_count_est": "number",
                   "occlusion_level": "string (None, Partial, Heavy)"
                },
                "logs": [
                  "string (technical log line 1)",
                  "string (technical log line 2)",
                  "string (technical log line 3)"
                ]
              }
              Make the logs sound extremely technical (e.g., 'Subsurface scattering vectors calculated', 'Mesh topology conforming to target').
            `},
            { inlineData: { mimeType: 'image/jpeg', data: cleanFrame } },
            { inlineData: { mimeType: 'image/jpeg', data: cleanFace } }
          ]
        },
        config: generationConfig
      });

      return response.text || '{}';
    } catch (error) {
      console.error('Gemini API Error:', error);
      // Fallback JSON if API fails
      return JSON.stringify({
        lighting: { type: 'Unknown', temperature: 5600, direction: '[0, 1, 0]' },
        geometry: { match_confidence: 85, poly_count_est: 12400, occlusion_level: 'None' },
        logs: ['System init failed, using heuristics', 'Mesh align default', 'Lighting estimated']
      });
    }
  }
}