import { Injectable, signal } from '@angular/core';

export interface ModelConfig {
  temperature: number;
  topK: number;
  topP: number;
  maxOutputTokens: number;
  thinkingBudget: number; // 0 to disable, >0 for gemini-2.5-flash thinking
  systemInstructionLevel: 'standard' | 'strict' | 'creative';
}

export interface RenderConfig {
  textureResolution: '2k' | '4k' | '8k';
  meshDensity: 'low' | 'medium' | 'high';
  temporalSmoothing: number; // 0-100
  raycastSamples: number;
  lightingModel: 'approximated' | 'raytraced';
}

export interface SystemConfig {
  auditVerbosity: 'minimal' | 'verbose' | 'forensic';
  watermarkOpacity: number; // 0-1
  allowSocialExport: boolean;
  debugOverlay: boolean;
  skipAnimations: boolean; // New: Bypass "fake" processing times
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  
  // AI Model Hyperparameters
  modelConfig = signal<ModelConfig>({
    temperature: 0.7, 
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
    thinkingBudget: 0, // Disabled by default for speed
    systemInstructionLevel: 'strict'
  });

  // VFX / Geometry Pipeline Settings
  renderConfig = signal<RenderConfig>({
    textureResolution: '4k',
    meshDensity: 'high',
    temporalSmoothing: 85,
    raycastSamples: 128,
    lightingModel: 'approximated'
  });

  // Compliance & Security
  systemConfig = signal<SystemConfig>({
    auditVerbosity: 'verbose',
    watermarkOpacity: 0.3, 
    allowSocialExport: true,
    debugOverlay: false,
    skipAnimations: false
  });

  constructor() {}

  updateModelConfig(partial: Partial<ModelConfig>) {
    this.modelConfig.update(current => ({ ...current, ...partial }));
  }

  updateRenderConfig(partial: Partial<RenderConfig>) {
    this.renderConfig.update(current => ({ ...current, ...partial }));
  }

  updateSystemConfig(partial: Partial<SystemConfig>) {
    this.systemConfig.update(current => ({ ...current, ...partial }));
  }
}