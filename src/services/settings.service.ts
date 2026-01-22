import { Injectable, signal } from '@angular/core';

export interface ModelConfig {
  temperature: number;
  topK: number;
  topP: number;
  systemInstructionLevel: 'standard' | 'strict' | 'creative';
}

export interface RenderConfig {
  textureResolution: '2k' | '4k' | '8k';
  meshDensity: 'low' | 'medium' | 'high';
  temporalSmoothing: number; // 0-100
  raycastSamples: number;
}

export interface SystemConfig {
  auditVerbosity: 'minimal' | 'verbose' | 'forensic';
  watermarkOpacity: number; // 0-1
  allowSocialExport: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  
  // AI Model Hyperparameters
  modelConfig = signal<ModelConfig>({
    temperature: 0.4, // Low temp for consistency/control
    topK: 32,
    topP: 0.95,
    systemInstructionLevel: 'strict'
  });

  // VFX / Geometry Pipeline Settings
  renderConfig = signal<RenderConfig>({
    textureResolution: '4k',
    meshDensity: 'high',
    temporalSmoothing: 85,
    raycastSamples: 128
  });

  // Compliance & Security
  systemConfig = signal<SystemConfig>({
    auditVerbosity: 'verbose',
    watermarkOpacity: 0.05, // Barely visible
    allowSocialExport: true
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