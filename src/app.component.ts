import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoStageComponent } from './components/video-stage.component';
import { CaptureModalComponent } from './components/capture-modal.component';
import { PipelineVisualizerComponent } from './components/pipeline-visualizer.component';
import { GatewayComponent } from './components/gateway.component';
import { SettingsPanelComponent } from './components/settings-panel.component';
import { GeminiService } from './services/gemini.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule, 
    VideoStageComponent, 
    CaptureModalComponent, 
    PipelineVisualizerComponent,
    GatewayComponent,
    SettingsPanelComponent
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  geminiService = inject(GeminiService);

  // Access Control
  hasAccess = signal(false);
  
  // Settings Visibility
  showSettings = signal(false);

  // State
  targetFrame = signal<string | null>(null);
  targetReady = signal(false);
  
  userIdentityImage = signal<string | null>(null);
  showCaptureModal = signal(false);
  
  isProcessing = signal(false);
  aiAnalysisData = signal<any>(null);

  grantAccess() {
    this.hasAccess.set(true);
  }

  toggleSettings() {
    this.showSettings.update(v => !v);
  }

  // Actions
  onFrameCaptured(dataUrl: string) {
    this.targetFrame.set(dataUrl);
    // Don't enable GO yet, we need user identity
  }

  onTargetDeclared(hasTarget: boolean) {
    this.targetReady.set(hasTarget);
  }

  openCapture() {
    this.showCaptureModal.set(true);
  }

  closeCapture() {
    this.showCaptureModal.set(false);
  }

  onIdentityConfirmed(image: string) {
    this.userIdentityImage.set(image);
    this.showCaptureModal.set(false);
  }

  async startProcessing() {
    if (!this.targetReady() || !this.userIdentityImage()) return;
    
    this.isProcessing.set(true);
    
    // Start backend analysis
    const frame = this.targetFrame();
    const face = this.userIdentityImage();
    
    if (frame && face) {
      try {
        const rawJson = await this.geminiService.analyzeScene(frame, face);
        // Clean JSON string (remove markdown code blocks if any, though system prompt forbids it)
        const jsonStr = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);
        this.aiAnalysisData.set(data);
      } catch (e) {
        console.error('Failed to parse AI response', e);
        // Pipeline visualizer will handle null data gracefully via fallbacks
      }
    }
  }

  get goButtonState(): 'disabled' | 'ready' | 'processing' {
    if (this.isProcessing()) return 'processing';
    if (this.targetReady() && this.userIdentityImage()) return 'ready';
    return 'disabled';
  }
}