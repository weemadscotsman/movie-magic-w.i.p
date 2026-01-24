import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-settings-panel',
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[60] flex justify-end bg-black/50 backdrop-blur-sm" (click)="close.emit()">
      <div class="w-[520px] h-full bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col font-mono animate-in slide-in-from-right duration-300" (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900">
          <div class="flex items-center gap-2 text-orange-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            <span class="font-bold tracking-widest text-xs uppercase">Core Configuration</span>
          </div>
          <button (click)="close.emit()" class="text-zinc-500 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-zinc-800 text-[10px] font-bold tracking-widest uppercase bg-zinc-900/50">
          <button (click)="activeTab.set('model')" class="flex-1 py-3 hover:bg-zinc-900 transition-colors border-b-2" [class.border-orange-500]="activeTab() === 'model'" [class.text-white]="activeTab() === 'model'" [class.border-transparent]="activeTab() !== 'model'" [class.text-zinc-500]="activeTab() !== 'model'">Model & Logic</button>
          <button (click)="activeTab.set('render')" class="flex-1 py-3 hover:bg-zinc-900 transition-colors border-b-2" [class.border-orange-500]="activeTab() === 'render'" [class.text-white]="activeTab() === 'render'" [class.border-transparent]="activeTab() !== 'render'" [class.text-zinc-500]="activeTab() !== 'render'">VFX Pipeline</button>
          <button (click)="activeTab.set('system')" class="flex-1 py-3 hover:bg-zinc-900 transition-colors border-b-2" [class.border-orange-500]="activeTab() === 'system'" [class.text-white]="activeTab() === 'system'" [class.border-transparent]="activeTab() !== 'system'" [class.text-zinc-500]="activeTab() !== 'system'">Sys & Audit</button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin">
          
          <!-- TAB: MODEL -->
          @if (activeTab() === 'model') {
            <section class="space-y-6 animate-in fade-in">
              
              <!-- Core Params -->
              <div class="space-y-4">
                <h3 class="text-orange-500 text-[10px] font-bold uppercase tracking-widest border-b border-zinc-800 pb-2">Stochastic Parameters</h3>
                
                <div class="grid grid-cols-2 gap-4">
                  <!-- Temperature -->
                  <div class="bg-zinc-900 border border-zinc-800 p-3">
                    <div class="flex justify-between mb-2">
                      <label class="text-zinc-400 text-[10px]">Temperature</label>
                      <span class="text-orange-500 text-[10px] font-bold">{{ settings.modelConfig().temperature }}</span>
                    </div>
                    <input type="range" min="0" max="2" step="0.1" [value]="settings.modelConfig().temperature" (input)="updateTemp($event)" class="w-full h-1 bg-zinc-700 appearance-none rounded-lg cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:rounded-full">
                  </div>

                  <!-- TopP -->
                  <div class="bg-zinc-900 border border-zinc-800 p-3">
                    <div class="flex justify-between mb-2">
                      <label class="text-zinc-400 text-[10px]">Top P (Nucleus)</label>
                      <span class="text-orange-500 text-[10px] font-bold">{{ settings.modelConfig().topP }}</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.05" [value]="settings.modelConfig().topP" (input)="updateTopP($event)" class="w-full h-1 bg-zinc-700 appearance-none rounded-lg cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:rounded-full">
                  </div>
                </div>

                <!-- TopK & Max Tokens -->
                <div class="grid grid-cols-2 gap-4">
                   <div class="bg-zinc-900 border border-zinc-800 p-3">
                     <div class="flex justify-between mb-2">
                      <label class="text-zinc-400 text-[10px]">Top K</label>
                      <span class="text-orange-500 text-[10px] font-bold">{{ settings.modelConfig().topK }}</span>
                    </div>
                    <input type="range" min="1" max="100" step="1" [value]="settings.modelConfig().topK" (input)="updateTopK($event)" class="w-full h-1 bg-zinc-700 appearance-none rounded-lg cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:rounded-full">
                   </div>
                   <div class="bg-zinc-900 border border-zinc-800 p-3">
                     <div class="flex justify-between mb-2">
                      <label class="text-zinc-400 text-[10px]">Max Tokens</label>
                      <span class="text-orange-500 text-[10px] font-bold">{{ settings.modelConfig().maxOutputTokens }}</span>
                    </div>
                    <input type="range" min="256" max="2048" step="128" [value]="settings.modelConfig().maxOutputTokens" (input)="updateMaxTokens($event)" class="w-full h-1 bg-zinc-700 appearance-none rounded-lg cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:rounded-full">
                   </div>
                </div>
              </div>

              <!-- Thinking Config -->
               <div>
                <h3 class="text-orange-500 text-[10px] font-bold uppercase tracking-widest border-b border-zinc-800 pb-2 mb-4">Reasoning Engine (Flash 2.5 Only)</h3>
                <div class="bg-zinc-900 border border-zinc-800 p-3">
                    <div class="flex justify-between mb-2">
                      <label class="text-zinc-400 text-[10px]">Thinking Budget (Tokens)</label>
                      <span class="text-orange-500 text-[10px] font-bold">{{ settings.modelConfig().thinkingBudget === 0 ? 'DISABLED' : settings.modelConfig().thinkingBudget }}</span>
                    </div>
                    <input type="range" min="0" max="500" step="50" [value]="settings.modelConfig().thinkingBudget" (input)="updateThinking($event)" class="w-full h-1 bg-zinc-700 appearance-none rounded-lg cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:rounded-full">
                    <p class="text-[9px] text-zinc-600 mt-2">Allocates hidden tokens for chain-of-thought processing before output. Increases latency.</p>
                </div>
              </div>

              <!-- Safety -->
              <div>
                <h3 class="text-orange-500 text-[10px] font-bold uppercase tracking-widest border-b border-zinc-800 pb-2 mb-4">Guardrails</h3>
                <div class="flex flex-col gap-2">
                  <button (click)="settings.updateModelConfig({ systemInstructionLevel: 'strict' })" class="px-4 py-3 border border-zinc-700 text-left text-xs transition-colors hover:border-orange-500 flex justify-between items-center" [class.bg-zinc-800]="settings.modelConfig().systemInstructionLevel === 'strict'">
                    <div>
                        <div class="font-bold text-zinc-200">STRICT PROTOCOL</div>
                        <div class="text-[9px] text-zinc-500">Zero deviation. High fidelity.</div>
                    </div>
                    @if(settings.modelConfig().systemInstructionLevel === 'strict') { <div class="w-2 h-2 bg-orange-500 rounded-full"></div> }
                  </button>
                  <button (click)="settings.updateModelConfig({ systemInstructionLevel: 'standard' })" class="px-4 py-3 border border-zinc-700 text-left text-xs transition-colors hover:border-orange-500 flex justify-between items-center" [class.bg-zinc-800]="settings.modelConfig().systemInstructionLevel === 'standard'">
                    <div>
                        <div class="font-bold text-zinc-200">STANDARD HEURISTICS</div>
                        <div class="text-[9px] text-zinc-500">Balanced interpretation.</div>
                    </div>
                     @if(settings.modelConfig().systemInstructionLevel === 'standard') { <div class="w-2 h-2 bg-orange-500 rounded-full"></div> }
                  </button>
                   <button (click)="settings.updateModelConfig({ systemInstructionLevel: 'creative' })" class="px-4 py-3 border border-zinc-700 text-left text-xs transition-colors hover:border-red-900 border-red-900/30 flex justify-between items-center" [class.bg-red-900/20]="settings.modelConfig().systemInstructionLevel === 'creative'">
                    <div>
                        <div class="font-bold text-red-400">CREATIVE OVERRIDE</div>
                        <div class="text-[9px] text-red-500/70">Unstable geometry generation. Audit Flagged.</div>
                    </div>
                    @if(settings.modelConfig().systemInstructionLevel === 'creative') { <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> }
                  </button>
                </div>
              </div>
            </section>
          }

          <!-- TAB: RENDER -->
          @if (activeTab() === 'render') {
            <section class="space-y-6 animate-in fade-in">
               <h3 class="text-orange-500 text-[10px] font-bold uppercase tracking-widest border-b border-zinc-800 pb-2">Geometry & Light</h3>
               
               <div class="grid grid-cols-2 gap-4">
                  <div class="bg-zinc-900 border border-zinc-800 p-4 flex flex-col gap-2">
                    <span class="text-[10px] text-zinc-500 uppercase">Texture Buffer</span>
                    <select (change)="updateRes($event)" class="bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs p-2 outline-none focus:border-orange-500 transition-colors">
                      <option value="2k" [selected]="settings.renderConfig().textureResolution === '2k'">2K (Proxy)</option>
                      <option value="4k" [selected]="settings.renderConfig().textureResolution === '4k'">4K (Cinema)</option>
                      <option value="8k" [selected]="settings.renderConfig().textureResolution === '8k'">8K (IMAX)</option>
                    </select>
                  </div>
                  <div class="bg-zinc-900 border border-zinc-800 p-4 flex flex-col gap-2">
                    <span class="text-[10px] text-zinc-500 uppercase">Mesh Density</span>
                    <select (change)="updateDensity($event)" class="bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs p-2 outline-none focus:border-orange-500 transition-colors">
                      <option value="low" [selected]="settings.renderConfig().meshDensity === 'low'">Low Poly</option>
                      <option value="medium" [selected]="settings.renderConfig().meshDensity === 'medium'">Medium</option>
                      <option value="high" [selected]="settings.renderConfig().meshDensity === 'high'">High (Raw)</option>
                    </select>
                  </div>
               </div>

                <div class="bg-zinc-900 border border-zinc-800 p-4 flex flex-col gap-2">
                    <span class="text-[10px] text-zinc-500 uppercase">Light Transport Model</span>
                    <select (change)="updateLighting($event)" class="bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs p-2 outline-none focus:border-orange-500 transition-colors">
                      <option value="approximated" [selected]="settings.renderConfig().lightingModel === 'approximated'">SH Approximation (Realtime)</option>
                      <option value="raytraced" [selected]="settings.renderConfig().lightingModel === 'raytraced'">Path Traced (Offline)</option>
                    </select>
                </div>

               <div class="bg-zinc-900 border border-zinc-800 p-4">
                  <div class="flex justify-between mb-2">
                    <label class="text-zinc-400 text-xs">Temporal Smoothing</label>
                    <span class="text-orange-500 text-xs font-bold">{{ settings.renderConfig().temporalSmoothing }}%</span>
                  </div>
                  <input type="range" min="0" max="100" [value]="settings.renderConfig().temporalSmoothing" (input)="updateSmoothing($event)" class="w-full h-1 bg-zinc-700 appearance-none rounded-lg cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:rounded-full">
               </div>

               <div class="bg-zinc-900 border border-zinc-800 p-4">
                  <div class="flex justify-between mb-2">
                    <label class="text-zinc-400 text-xs">Raycast Samples (Probe)</label>
                    <span class="text-orange-500 text-xs font-bold">{{ settings.renderConfig().raycastSamples }}</span>
                  </div>
                  <input type="range" min="32" max="512" step="32" [value]="settings.renderConfig().raycastSamples" (input)="updateRaycast($event)" class="w-full h-1 bg-zinc-700 appearance-none rounded-lg cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:rounded-full">
               </div>
            </section>
          }

          <!-- TAB: SYSTEM -->
          @if (activeTab() === 'system') {
            <section class="space-y-6 animate-in fade-in">
              <h3 class="text-orange-500 text-[10px] font-bold uppercase tracking-widest border-b border-zinc-800 pb-2">Audit & Debug</h3>
              
               <div class="bg-zinc-900 border border-zinc-800 p-4">
                  <div class="flex justify-between mb-2">
                    <label class="text-zinc-400 text-xs">Audit Verbosity</label>
                  </div>
                  <div class="flex gap-2">
                    <button (click)="settings.updateSystemConfig({ auditVerbosity: 'minimal' })" class="flex-1 py-2 border border-zinc-700 text-[10px] hover:bg-zinc-800 transition-colors" [class.bg-zinc-700]="settings.systemConfig().auditVerbosity === 'minimal'">MIN</button>
                    <button (click)="settings.updateSystemConfig({ auditVerbosity: 'verbose' })" class="flex-1 py-2 border border-zinc-700 text-[10px] hover:bg-zinc-800 transition-colors" [class.bg-zinc-700]="settings.systemConfig().auditVerbosity === 'verbose'">VERBOSE</button>
                    <button (click)="settings.updateSystemConfig({ auditVerbosity: 'forensic' })" class="flex-1 py-2 border border-zinc-700 text-[10px] hover:bg-zinc-800 transition-colors" [class.bg-zinc-700]="settings.systemConfig().auditVerbosity === 'forensic'">FORENSIC</button>
                  </div>
               </div>

               <!-- Watermark Control -->
               <div class="bg-zinc-900 border border-zinc-800 p-4">
                  <div class="flex justify-between mb-2">
                    <label class="text-zinc-400 text-xs">Watermark Opacity</label>
                    <span class="text-orange-500 text-xs font-bold">{{ (settings.systemConfig().watermarkOpacity * 100).toFixed(0) }}%</span>
                  </div>
                  <input type="range" min="0" max="1" step="0.05" [value]="settings.systemConfig().watermarkOpacity" (input)="updateWatermark($event)" class="w-full h-1 bg-zinc-700 appearance-none rounded-lg cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:rounded-full">
               </div>

               <!-- Toggles -->
               <div class="space-y-3">
                 <div class="bg-zinc-900 border border-zinc-800 p-4 flex items-center justify-between">
                    <div class="flex flex-col">
                      <span class="text-xs text-zinc-300 font-bold">Debug Overlay</span>
                      <span class="text-[9px] text-zinc-600">Show perf metrics on video stage.</span>
                    </div>
                    <button (click)="toggleDebug()" class="w-10 h-5 rounded-full bg-zinc-700 relative transition-colors" [class.bg-green-700]="settings.systemConfig().debugOverlay">
                      <div class="absolute top-1 bottom-1 w-3 h-3 bg-white rounded-full transition-all" [class.left-1]="!settings.systemConfig().debugOverlay" [class.right-1]="settings.systemConfig().debugOverlay"></div>
                    </button>
                 </div>

                 <div class="bg-zinc-900 border border-zinc-800 p-4 flex items-center justify-between">
                    <div class="flex flex-col">
                      <span class="text-xs text-zinc-300 font-bold">Pro Workflow (Skip Anim)</span>
                      <span class="text-[9px] text-zinc-600">Bypass cosmetic encryption delays.</span>
                    </div>
                    <button (click)="toggleSkip()" class="w-10 h-5 rounded-full bg-zinc-700 relative transition-colors" [class.bg-green-700]="settings.systemConfig().skipAnimations">
                      <div class="absolute top-1 bottom-1 w-3 h-3 bg-white rounded-full transition-all" [class.left-1]="!settings.systemConfig().skipAnimations" [class.right-1]="settings.systemConfig().skipAnimations"></div>
                    </button>
                 </div>

                 <div class="bg-zinc-900 border border-zinc-800 p-4 flex items-center justify-between">
                    <div class="flex flex-col">
                      <span class="text-xs text-zinc-300 font-bold">Allow Social Export</span>
                      <span class="text-[9px] text-zinc-600">Strictly screenshot only. No video.</span>
                    </div>
                    <button (click)="toggleSocial()" class="w-10 h-5 rounded-full bg-zinc-700 relative transition-colors" [class.bg-green-700]="settings.systemConfig().allowSocialExport">
                      <div class="absolute top-1 bottom-1 w-3 h-3 bg-white rounded-full transition-all" [class.left-1]="!settings.systemConfig().allowSocialExport" [class.right-1]="settings.systemConfig().allowSocialExport"></div>
                    </button>
                 </div>
               </div>
               
               <div class="p-4 border border-red-900/30 bg-red-950/10 text-red-500 text-[10px] font-mono leading-relaxed mt-4">
                 WARNING: Changing configuration parameters during an active session will trigger a re-validation of the license hash. Proceedings are logged to the immutable ledger.
               </div>
            </section>
          }
        </div>
        
        <!-- Footer -->
        <div class="p-4 border-t border-zinc-800 bg-zinc-950 text-center">
          <div class="text-[9px] text-zinc-600 uppercase tracking-widest">Config Hash: {{ configHash() }}</div>
        </div>

      </div>
    </div>
  `
})
export class SettingsPanelComponent {
  settings = inject(SettingsService);
  close = output<void>();
  activeTab = signal<'model' | 'render' | 'system'>('model');

  // Input Handlers
  updateTemp(e: Event) { this.settings.updateModelConfig({ temperature: Number((e.target as HTMLInputElement).value) }); }
  updateTopK(e: Event) { this.settings.updateModelConfig({ topK: Number((e.target as HTMLInputElement).value) }); }
  updateTopP(e: Event) { this.settings.updateModelConfig({ topP: Number((e.target as HTMLInputElement).value) }); }
  updateMaxTokens(e: Event) { this.settings.updateModelConfig({ maxOutputTokens: Number((e.target as HTMLInputElement).value) }); }
  updateThinking(e: Event) { this.settings.updateModelConfig({ thinkingBudget: Number((e.target as HTMLInputElement).value) }); }

  updateRes(e: Event) { this.settings.updateRenderConfig({ textureResolution: (e.target as HTMLSelectElement).value as any }); }
  updateDensity(e: Event) { this.settings.updateRenderConfig({ meshDensity: (e.target as HTMLSelectElement).value as any }); }
  updateLighting(e: Event) { this.settings.updateRenderConfig({ lightingModel: (e.target as HTMLSelectElement).value as any }); }
  updateSmoothing(e: Event) { this.settings.updateRenderConfig({ temporalSmoothing: Number((e.target as HTMLInputElement).value) }); }
  updateRaycast(e: Event) { this.settings.updateRenderConfig({ raycastSamples: Number((e.target as HTMLInputElement).value) }); }

  updateWatermark(e: Event) { this.settings.updateSystemConfig({ watermarkOpacity: Number((e.target as HTMLInputElement).value) }); }
  toggleSocial() { this.settings.updateSystemConfig({ allowSocialExport: !this.settings.systemConfig().allowSocialExport }); }
  toggleDebug() { this.settings.updateSystemConfig({ debugOverlay: !this.settings.systemConfig().debugOverlay }); }
  toggleSkip() { this.settings.updateSystemConfig({ skipAnimations: !this.settings.systemConfig().skipAnimations }); }

  get configHash() {
    return () => `0x${Math.floor(this.settings.modelConfig().temperature * 1000).toString(16).toUpperCase()}${this.settings.renderConfig().textureResolution.toUpperCase()}-${Date.now().toString(16).substring(8).toUpperCase()}`;
  }
}