import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OllamaService {
  // Configured for local setup.
  // Ensure Ollama is running with `ollama serve` and OLLAMA_ORIGINS="*"
  // Model should be 'llava' or another vision-capable model.
  private apiUrl = 'http://localhost:11434/api/generate';
  private model = 'llava'; 

  async analyzeScene(frameBase64: string, faceBase64: string): Promise<string> {
    const cleanFrame = this.cleanBase64(frameBase64);
    const cleanFace = this.cleanBase64(faceBase64);

    const prompt = `
    Role: Cinema VFX Supervisor.
    Task: Analyze these two images (Source Frame and Target Identity).
    Output: Strictly valid JSON. No markdown.
    
    JSON Structure:
    {
      "lighting": { 
        "type": "string (e.g. Tungsten, Daylight, Neon)", 
        "temperature": "number (Kelvin)", 
        "direction": "string" 
      },
      "geometry": { 
        "match_confidence": "number (0-100)", 
        "poly_count_est": "number", 
        "occlusion_level": "string" 
      },
      "logs": [
        "technical_log_1",
        "technical_log_2",
        "technical_log_3"
      ]
    }
    
    Content requirements:
    - Estimate lighting conditions from the frame.
    - Estimate geometric complexity of the face.
    - Generate 3-4 realistic rendering pipeline log messages.
    `;

    try {
      const payload = {
        model: this.model,
        prompt: prompt,
        images: [cleanFrame, cleanFace],
        stream: false,
        format: 'json'
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Ollama API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.response;

    } catch (error) {
      console.error('Ollama Service Error:', error);
      
      // Detailed fallback for debugging local setup
      return JSON.stringify({
        lighting: { type: 'Local_Est_Fallback', temperature: 5600, direction: 'Front-Left' },
        geometry: { match_confidence: 0, poly_count_est: 0, occlusion_level: 'Unknown' },
        logs: [
          'ERROR: Ollama connection failed',
          'CHECK: Is "ollama serve" running?',
          'CHECK: Is model "llava" pulled?',
          'CHECK: OLLAMA_ORIGINS="*"'
        ]
      });
    }
  }

  private cleanBase64(data: string): string {
    // Ollama expects raw base64 without the data URL prefix
    if (data.includes(',')) {
      return data.split(',')[1];
    }
    return data;
  }
}