import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-settings-panel',
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm" (click)="close.emit()">
      <div class="w-[480px] h-full bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col font-mono animate-in slide-in-from-right duration-300" (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900">
          <div class="flex items-center gap-2 text-orange-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <span class="font-bold tracking-widest text-xs uppercase">Pipeline Config</span>
          </div>
          <button (click)="close.emit()" class="text-zinc-500 hover:text-white transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-zinc-800 text-[10px] font-bold tracking-widest uppercase">
          <button (click)="activeTab.set('model')" class="flex-1 py-3 hover:bg-zinc-900 transition-colors border-b-2" [class.border-orange-500]="activeTab() === 'model'" [class.text-white]="activeTab() === 'model'" [class.border-transparent]="activeTab() !== 'model'" [class.text-zinc-500]="activeTab() !== 'model'">AI Model</button>
          <button (click)="activeTab.set('render')" class="flex-1 py-3 hover:bg-zinc-900 transition-colors border-b-2" [class.border-orange-500]="activeTab() === 'render'" [class.text-white]="activeTab() === 'render'" [class.border-transparent]="activeTab() !== 'render'" [class.text-zinc-500]="activeTab() !== 'render'">Rendering</button>
          <button (click)="activeTab.set('system')" class="flex-1 py-3 hover:bg-zinc-900 transition-colors border-b-2" [class.border-orange-500]="activeTab() === 'system'" [class.text-white]="activeTab() === 'system'" [class.border-transparent]="activeTab() !== 'system'" [class.text-zinc-500]="activeTab() !== 'system'">Compliance</button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6 space-y-8">
          
          <!-- TAB: MODEL -->
          @if (activeTab() === 'model') {
            <section class="space-y-6 animate-in fade-in">
              <div>
                <h3 class="text-orange-500 text-[10px] font-bold uppercase tracking-widest mb-4">Hyperparameters</h3>
                
                <div class="space-y-4">
                  <!-- Temperature -->
                  <div class="bg-zinc-900 border border-zinc-800 p-4">
                    <div class="flex justify-between mb-2">
                      <label class="text-zinc-400 text-xs">Temperature (Creativity)</label>
                      <span class="text-orange-500 text-xs font-bold">{{ settings.modelConfig().temperature }}</span>
                    </div>
                    <input type="range" min="0" max="2" step="0.1" [value]="settings.modelConfig().temperature" (input)="updateTemp($event)" class="w-full h-1 bg-zinc-700 appearance-none rounded-lg cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:rounded-full">
                    <p class="text-[9px] text-zinc-600 mt-2">Lower values produce more deterministic geometry. Higher values introduce hallucination risks.</p>
                  </div>

                  <!-- TopK -->
                  <div class="bg-zinc-900 border border-zinc-800 p-4">
                     <div class="flex justify-between mb-2">
                      <label class="text-zinc-400 text-xs">TopK (Token Pool)</label>
                      <span class="text-orange-500 text-xs font-bold">{{ settings.modelConfig().topK }}</span>
                    </div>
                    <input type="range" min="1" max="100" step="1" [value]="settings.modelConfig().topK" (input)="updateTopK($event)" class="w-full h-1 bg-zinc-700 appearance-none rounded-lg cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:rounded-full">
                  </div>
                </div>
              </div>

              <div>
                <h3 class="text-orange-500 text-[10px] font-bold uppercase tracking-widest mb-4">Instruction Safety</h3>
                <div class="flex flex-col gap-2">
                  <button (click)="settings.updateModelConfig({ systemInstructionLevel: 'strict' })" class="px-4 py-3 border border-zinc-700 text-left text-xs transition-colors hover:border-orange-500" [class.bg-zinc-800]="settings.modelConfig().systemInstructionLevel === 'strict'">
                    <div class="font-bold text-zinc-200">STRICT (Default)</div>
                    <div class="text-[9px] text-zinc-500">Rigid adherence to geometry. No improvisation.</div>
                  </button>
                  <button (click)="settings.updateModelConfig({ systemInstructionLevel: 'standard' })" class="px-4 py-3 border border-zinc-700 text-left text-xs transition-colors hover:border-orange-500" [class.bg-zinc-800]="settings.modelConfig().systemInstructionLevel === 'standard'">
                    <div class="font-bold text-zinc-200">STANDARD</div>
                    <div class="text-[9px] text-zinc-500">Balanced lighting estimation.</div>
                  </button>
                   <button (click)="settings.updateModelConfig({ systemInstructionLevel: 'creative' })" class="px-4 py-3 border border-zinc-700 text-left text-xs transition-colors hover:border-red-900 border-red-900/30" [class.bg-red-900/20]="settings.modelConfig().systemInstructionLevel === 'creative'">
                    <div class="font-bold text-red-400">CREATIVE (Unstable)</div>
                    <div class="text-[9px] text-red-500/70">Allows hallucination of non-existent features. Audit flag triggered.</div>
                  </button>
                </div>
              </div>
            </section>
          }

          <!-- TAB: RENDER -->
          @if (activeTab() === 'render') {
            <section class="space-y-6 animate-in fade-in">
               <h3 class="text-orange-500 text-[10px] font-bold uppercase tracking-widest mb-4">Geometry Pipeline</h3>
               
               <div class="grid grid-cols-2 gap-4">
                  <div class="bg-zinc-900 border border-zinc-800 p-4 flex flex-col gap-2">
                    <span class="text-[10px] text-zinc-500 uppercase">Texture Res</span>
                    <select (change)="updateRes($event)" class="bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs p-2 outline-none">
                      <option value="2k" [selected]="settings.renderConfig().textureResolution === '2k'">2K (Proxy)</option>
                      <option value="4k" [selected]="settings.renderConfig().textureResolution === '4k'">4K (Cinema)</option>
                      <option value="8k" [selected]="settings.renderConfig().textureResolution === '8k'">8K (IMAX)</option>
                    </select>
                  </div>
                  <div class="bg-zinc-900 border border-zinc-800 p-4 flex flex-col gap-2">
                    <span class="text-[10px] text-zinc-500 uppercase">Mesh Density</span>
                    <select (change)="updateDensity($event)" class="bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs p-2 outline-none">
                      <option value="low" [selected]="settings.renderConfig().meshDensity === 'low'">Low Poly</option>
                      <option value="medium" [selected]="settings.renderConfig().meshDensity === 'medium'">Medium</option>
                      <option value="high" [selected]="settings.renderConfig().meshDensity === 'high'">High (Raw)</option>
                    </select>
                  </div>
               </div>

               <div class="bg-zinc-900 border border-zinc-800 p-4">
                  <div class="flex justify-between mb-2">
                    <label class="text-zinc-400 text-xs">Temporal Smoothing</label>
                    <span class="text-orange-500 text-xs font-bold">{{ settings.renderConfig().temporalSmoothing }}%</span>
                  </div>
                  <input type="range" min="0" max="100" [value]="settings.renderConfig().temporalSmoothing" (input)="updateSmoothing($event)" class="w-full h-1 bg-zinc-700 appearance-none rounded-lg cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:rounded-full">
                  <p class="text-[9px] text-zinc-600 mt-2">Higher values reduce jitter but introduces 'ghosting' lag.</p>
               </div>
            </section>
          }

          <!-- TAB: SYSTEM -->
          @if (activeTab() === 'system') {
            <section class="space-y-6 animate-in fade-in">
              <h3 class="text-orange-500 text-[10px] font-bold uppercase tracking-widest mb-4">Audit & Compliance</h3>
              
               <div class="bg-zinc-900 border border-zinc-800 p-4">
                  <div class="flex justify-between mb-2">
                    <label class="text-zinc-400 text-xs">Audit Verbosity</label>
                  </div>
                  <div class="flex gap-2">
                    <button (click)="settings.updateSystemConfig({ auditVerbosity: 'minimal' })" class="flex-1 py-2 border border-zinc-700 text-[10px] hover:bg-zinc-800" [class.bg-zinc-700]="settings.systemConfig().auditVerbosity === 'minimal'">MIN</button>
                    <button (click)="settings.updateSystemConfig({ auditVerbosity: 'verbose' })" class="flex-1 py-2 border border-zinc-700 text-[10px] hover:bg-zinc-800" [class.bg-zinc-700]="settings.systemConfig().auditVerbosity === 'verbose'">VERBOSE</button>
                    <button (click)="settings.updateSystemConfig({ auditVerbosity: 'forensic' })" class="flex-1 py-2 border border-zinc-700 text-[10px] hover:bg-zinc-800" [class.bg-zinc-700]="settings.systemConfig().auditVerbosity === 'forensic'">FORENSIC</button>
                  </div>
               </div>

               <div class="bg-zinc-900 border border-zinc-800 p-4 flex items-center justify-between">
                  <div class="flex flex-col">
                    <span class="text-xs text-zinc-300">Allow Social Export</span>
                    <span class="text-[9px] text-zinc-600">Strictly screenshot only. No video.</span>
                  </div>
                  <button (click)="toggleSocial()" class="w-10 h-5 rounded-full bg-zinc-700 relative transition-colors" [class.bg-green-700]="settings.systemConfig().allowSocialExport">
                    <div class="absolute top-1 bottom-1 w-3 h-3 bg-white rounded-full transition-all" [class.left-1]="!settings.systemConfig().allowSocialExport" [class.right-1]="settings.systemConfig().allowSocialExport"></div>
                  </button>
               </div>
               
               <div class="p-4 border border-red-900/30 bg-red-950/10 text-red-500 text-[10px] font-mono leading-relaxed">
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
  updateTemp(e: Event) {
    const val = Number((e.target as HTMLInputElement).value);
    this.settings.updateModelConfig({ temperature: val });
  }

  updateTopK(e: Event) {
    const val = Number((e.target as HTMLInputElement).value);
    this.settings.updateModelConfig({ topK: val });
  }

  updateRes(e: Event) {
    const val = (e.target as HTMLSelectElement).value as any;
    this.settings.updateRenderConfig({ textureResolution: val });
  }

  updateDensity(e: Event) {
    const val = (e.target as HTMLSelectElement).value as any;
    this.settings.updateRenderConfig({ meshDensity: val });
  }

  updateSmoothing(e: Event) {
    const val = Number((e.target as HTMLInputElement).value);
    this.settings.updateRenderConfig({ temporalSmoothing: val });
  }

  toggleSocial() {
    this.settings.updateSystemConfig({ allowSocialExport: !this.settings.systemConfig().allowSocialExport });
  }

  get configHash() {
    // Fake hash just for visuals
    return () => `0x${Math.floor(this.settings.modelConfig().temperature * 1000).toString(16).toUpperCase()}${this.settings.renderConfig().textureResolution.toUpperCase()}`;
  }
}