import { Component, input, signal, effect, OnChanges, SimpleChanges, inject, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../services/settings.service';

interface PipelineStep {
  id: number;
  name: string;
  status: 'pending' | 'active' | 'complete';
  details: string;
}

interface LogEntry {
  time: string;
  text: string;
  type?: 'info' | 'audit' | 'error' | 'warn';
}

@Component({
  selector: 'app-pipeline-visualizer',
  imports: [CommonModule],
  template: `
    <div class="absolute inset-0 z-40 bg-black flex flex-col font-mono text-xs select-none">
      
      <!-- Header / Telemetry -->
      <div class="h-16 border-b border-zinc-800 flex items-center px-6 justify-between bg-zinc-950 shadow-md z-10">
         <div class="flex items-center gap-4 text-orange-500">
           <div class="flex items-center gap-2">
             <div class="w-2 h-2 bg-orange-500 animate-pulse rounded-full"></div>
             <span class="tracking-widest font-bold">PIPELINE ACTIVE</span>
           </div>
           <div class="h-4 w-px bg-zinc-800"></div>
           <div class="flex gap-4 text-[10px] text-zinc-400 font-mono">
              <div class="flex flex-col">
                <span class="text-zinc-600">MODEL</span>
                <span class="text-zinc-300">GEMINI-2.5-FLASH</span>
              </div>
              <div class="flex flex-col">
                 <span class="text-zinc-600">TEMP</span>
                 <span class="text-orange-500 font-bold">{{ settings.modelConfig().temperature }}</span>
              </div>
              <div class="flex flex-col">
                 <span class="text-zinc-600">THINKING</span>
                 <span class="text-zinc-300">{{ settings.modelConfig().thinkingBudget > 0 ? settings.modelConfig().thinkingBudget + 'tks' : 'OFF' }}</span>
              </div>
           </div>
         </div>
         
         <div class="flex gap-6 text-[10px]">
           <div class="flex flex-col items-end">
             <span class="text-zinc-600">SESSION ID</span>
             <span class="text-zinc-300">{{ sessionId }}</span>
           </div>
           <div class="flex flex-col items-end w-24">
             <span class="text-zinc-600">VRAM USAGE</span>
             <div class="w-full h-1 bg-zinc-800 mt-1 rounded-full overflow-hidden">
               <div class="h-full bg-zinc-400 transition-all duration-300" [style.width.%]="vramUsage()"></div>
             </div>
             <span class="text-zinc-500 text-[9px] mt-0.5">{{ vramUsage() }}%</span>
           </div>
         </div>
      </div>

      <div class="flex-1 flex overflow-hidden">
        
        <!-- Left: Steps List -->
        <div class="w-80 border-r border-zinc-800 bg-zinc-900/30 flex flex-col">
           <div class="p-6 space-y-8 flex-1 overflow-y-auto">
             @for (step of steps(); track step.id) {
               <div class="relative pl-6 transition-all duration-500" 
                    [class.opacity-30]="step.status === 'pending'"
                    [class.opacity-100]="step.status !== 'pending'"
                    [class.scale-105]="step.status === 'active'">
                  
                  <!-- Status Indicator Line -->
                  <div class="absolute left-0 top-0 bottom-0 w-1 transition-colors duration-300 rounded-full"
                       [class.bg-zinc-800]="step.status === 'pending'"
                       [class.bg-orange-500]="step.status === 'active'"
                       [class.bg-green-500]="step.status === 'complete'"
                       [class.shadow-[0_0_10px_rgba(249,115,22,0.8)]]="step.status === 'active'"
                  ></div>

                  <div class="text-[11px] font-bold mb-1 text-zinc-200 tracking-wider">{{ step.name }}</div>
                  <div class="text-[9px] text-zinc-500 font-light leading-relaxed">{{ step.details }}</div>
               </div>
             }
           </div>
           
           <!-- System Stats Footer -->
           <div class="p-4 border-t border-zinc-800 bg-zinc-950/50">
              <div class="flex justify-between text-[9px] text-zinc-500 mb-1">
                 <span>CORE LOAD</span>
                 <span>{{ coreLoad() }}%</span>
              </div>
              <div class="w-full h-8 flex items-end gap-[1px] opacity-50">
                 @for (bar of loadHistory(); track $index) {
                   <div class="flex-1 bg-orange-500/50 transition-all duration-100" [style.height.%]="bar"></div>
                 }
              </div>
           </div>
        </div>

        <!-- Right: Terminal Output -->
        <div class="flex-1 bg-black p-6 font-mono text-xs text-zinc-300 overflow-hidden flex flex-col relative">
          
          <!-- Watermark -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
            <div class="text-9xl font-black text-white transform -rotate-12 whitespace-nowrap">CLASSIFIED // EYES ONLY</div>
          </div>

          <div class="mb-4 text-zinc-500 border-b border-zinc-800 pb-2 flex justify-between items-center">
            <span class="tracking-widest font-bold">SYSTEM LOG // VERBOSE</span>
            <div class="flex gap-2 text-[9px]">
               <span class="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded">AUDIT: {{ settings.systemConfig().auditVerbosity.toUpperCase() }}</span>
               <span class="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded">RES: {{ settings.renderConfig().textureResolution.toUpperCase() }}</span>
            </div>
          </div>
          
          <div class="flex-1 overflow-y-auto flex flex-col-reverse relative z-10 scroll-smooth pr-2">
             @for (log of logs(); track $index) {
               <div class="mb-1.5 transition-opacity duration-300 animate-in slide-in-from-left-2 fade-in hover:bg-zinc-900/50 -mx-2 px-2 py-0.5 rounded">
                 <span class="text-zinc-600 mr-3 text-[10px] font-light">[{{ log.time }}]</span> 
                 
                 @if (log.type === 'audit') {
                    <span class="text-green-900 bg-green-900/20 px-1 rounded text-[9px] font-bold uppercase tracking-wider mr-2 border border-green-900/30">AUDIT</span>
                    <span class="text-zinc-400 italic">{{ log.text }}</span>
                 } @else if (log.type === 'warn') {
                    <span class="text-orange-500 font-bold mr-2">WARN >></span>
                    <span class="text-orange-200">{{ log.text }}</span>
                 } @else {
                    <span class="text-zinc-300">{{ log.text }}</span>
                 }
               </div>
             }
          </div>
        </div>
      </div>
      
      <!-- Completion State -->
       @if (isComplete()) {
         <div class="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-black via-zinc-950 to-transparent flex items-end justify-center pb-12 animate-in fade-in slide-in-from-bottom-10 z-50">
            <div class="text-center p-8 bg-black/80 border border-zinc-800 backdrop-blur-md shadow-2xl rounded-sm max-w-md w-full">
              <div class="flex items-center justify-center gap-3 mb-4">
                 <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 <span class="text-green-400 font-bold text-2xl tracking-widest">RENDER COMPLETE</span>
              </div>
              
              <div class="grid grid-cols-2 gap-4 text-[10px] text-zinc-500 mb-6 text-left font-mono bg-zinc-900/50 p-4 border border-zinc-800/50">
                 <div class="flex justify-between"><span>Compute Time:</span> <span class="text-zinc-300">14.2s</span></div>
                 <div class="flex justify-between"><span>Tokens:</span> <span class="text-zinc-300">{{ settings.modelConfig().maxOutputTokens }}</span></div>
                 <div class="flex justify-between"><span>Resolution:</span> <span class="text-zinc-300">{{ settings.renderConfig().textureResolution.toUpperCase() }}</span></div>
                 <div class="flex justify-between"><span>Lighting:</span> <span class="text-zinc-300">{{ settings.renderConfig().lightingModel === 'raytraced' ? 'PATH TRACED' : 'APPROX' }}</span></div>
              </div>
              
              <div class="w-full px-8 py-3 bg-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-[0.2em] animate-pulse">
                COMPILING FINAL RENDER...
              </div>
            </div>
         </div>
       }

    </div>
  `
})
export class PipelineVisualizerComponent implements OnChanges {
  settings = inject(SettingsService);
  aiData = input<any>(null);
  startTrigger = input<boolean>(false);
  complete = output<void>();
  
  steps = signal<PipelineStep[]>([
    { id: 1, name: 'CHARACTER SWEEP', status: 'pending', details: 'Scanning frame buffer for target vectors.' },
    { id: 2, name: 'GEOMETRY RECONSTRUCTION', status: 'pending', details: 'Mapping facial topology to mesh.' },
    { id: 3, name: 'LIGHTING & MATERIAL', status: 'pending', details: 'Estimating scene lux and temperature.' },
    { id: 4, name: 'REPLACEMENT RENDER', status: 'pending', details: 'Injecting identity materials.' },
    { id: 5, name: 'TEMPORAL SANITY', status: 'pending', details: 'Smoothing micro-expressions across t-axis.' },
  ]);

  logs = signal<LogEntry[]>([]);
  isComplete = signal(false);
  sessionId = Math.random().toString(36).substring(7).toUpperCase();
  
  // Simulated Stats
  vramUsage = signal(24);
  coreLoad = signal(12);
  loadHistory = signal<number[]>(new Array(30).fill(10));

  constructor() {
    // Start simulation loop for stats
    setInterval(() => {
      if (this.startTrigger() && !this.isComplete()) {
        this.vramUsage.update(v => Math.min(99, v + Math.random() * 5));
        const newLoad = Math.floor(Math.random() * 40) + 40;
        this.coreLoad.set(newLoad);
        this.loadHistory.update(h => [...h.slice(1), newLoad]);
      }
    }, 500);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['startTrigger'] && changes['startTrigger'].currentValue === true) {
      this.configurePipeline();
      this.runPipeline();
    }
  }

  // Adjust pipeline steps based on settings
  private configurePipeline() {
     const renderConfig = this.settings.renderConfig();
     
     if (renderConfig.lightingModel === 'raytraced') {
       this.updateStepName(2, 'PATH TRACER INTEGRATION');
       this.updateStepDetails(2, `Monte Carlo sampling at ${renderConfig.raycastSamples} spp.`);
     }

     if (renderConfig.meshDensity === 'high') {
       this.updateStepDetails(1, 'High-fidelity topology mapping (SubDiv Level 4).');
     }
  }

  private addLog(text: string, type: 'info' | 'audit' | 'error' | 'warn' = 'info') {
    const time = new Date().toISOString().split('T')[1].slice(0, -1);
    this.logs.update(l => [...l, { time, text, type }]);
  }

  async runPipeline() {
    const config = this.settings.modelConfig();
    
    this.addLog(`Initializing Pipeline [v2.6.0]`, 'info');
    this.addLog(`Audit Level: ${this.settings.systemConfig().auditVerbosity}`, 'audit');
    this.addLog(`Model Config: T=${config.temperature} | K=${config.topK} | P=${config.topP}`, 'info');

    if (config.thinkingBudget > 0) {
       this.addLog(`Thinking Budget Reserved: ${config.thinkingBudget} tokens`, 'warn');
    }
    
    // Step 1: Sweep
    await this.processStep(0, 1500, ['Frame scan initiated...', 'Target vectors locked', 'Isolating alpha channel']);
    
    // Step 2: Geometry (Use AI Data)
    const geomDetails = this.aiData()?.geometry;
    const geomConf = geomDetails ? `Confidence: ${geomDetails.match_confidence}%` : 'Standard Alignment';
    this.updateStepDetails(1, geomConf);
    
    const aiLogs = this.aiData()?.logs || ['Mesh generated', 'Vertices aligned'];
    await this.processStep(1, 2000, ['Analyzing topology...', ...aiLogs.slice(0, 2)]);
    
    // Step 3: Lighting
    const lighting = this.aiData()?.lighting;
    const lightInfo = lighting ? `Source: ${lighting.type} (${lighting.temperature}K)` : 'Estimating scene lux...';
    
    // Custom logs based on lighting mode
    const lightingLogs = this.settings.renderConfig().lightingModel === 'raytraced'
      ? ['Building BVH structure...', 'Casting shadow rays...', 'Denoising lightmap...']
      : [`Light Vector: ${lighting?.direction || '[0,1,0]'}`, 'Spherical Harmonics projected'];

    this.updateStepDetails(2, lightInfo);
    await this.processStep(2, 2500, lightingLogs);
    
    // Step 4: Replacement
    this.addLog('Injecting identity_vault_01...', 'audit');
    await this.processStep(3, 2200, ['Mapping diffuse textures', 'Applying subsurface scattering', 'Blending edges']);
    
    // Step 5: Sanity
    const smoothing = this.settings.renderConfig().temporalSmoothing;
    await this.processStep(4, 1500, [`Temporal flow analyzer active (${smoothing}%)`, 'Reducing jitter', 'Final composite ok']);
    
    this.addLog(`Watermark embedded (Opacity: ${this.settings.systemConfig().watermarkOpacity})`, 'audit');
    this.addLog('PIPELINE FINISHED. ASSET SEALED.', 'info');

    this.isComplete.set(true);

    setTimeout(() => {
      this.complete.emit();
    }, 3000);
  }

  private async processStep(index: number, duration: number, stepLogs: string[]) {
    this.updateStepStatus(index, 'active');
    
    // Skip animation logic from settings
    const actualDuration = this.settings.systemConfig().skipAnimations ? 200 : duration;
    const interval = actualDuration / stepLogs.length;

    for (const log of stepLogs) {
      this.addLog(log);
      await new Promise(r => setTimeout(r, interval));
    }
    this.updateStepStatus(index, 'complete');
  }

  private updateStepStatus(index: number, status: 'pending' | 'active' | 'complete') {
    this.steps.update(steps => {
      const newSteps = [...steps];
      newSteps[index] = { ...newSteps[index], status };
      return newSteps;
    });
  }

  private updateStepName(index: number, name: string) {
    this.steps.update(steps => {
      const newSteps = [...steps];
      newSteps[index] = { ...newSteps[index], name };
      return newSteps;
    });
  }

  private updateStepDetails(index: number, details: string) {
    this.steps.update(steps => {
      const newSteps = [...steps];
      newSteps[index] = { ...newSteps[index], details };
      return newSteps;
    });
  }
}
