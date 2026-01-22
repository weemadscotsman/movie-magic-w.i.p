import { Component, input, signal, effect, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PipelineStep {
  id: number;
  name: string;
  status: 'pending' | 'active' | 'complete';
  details: string;
}

interface LogEntry {
  time: string;
  text: string;
  type?: 'info' | 'audit' | 'error';
}

@Component({
  selector: 'app-pipeline-visualizer',
  imports: [CommonModule],
  template: `
    <div class="absolute inset-0 z-40 bg-black flex flex-col font-mono">
      
      <!-- Header -->
      <div class="h-16 border-b border-zinc-800 flex items-center px-8 justify-between bg-zinc-950">
         <div class="flex items-center gap-2 text-orange-500">
           <div class="w-3 h-3 bg-orange-500 animate-pulse rounded-full"></div>
           <span class="tracking-widest font-bold">RENDER PIPELINE ACTIVE</span>
         </div>
         <div class="text-zinc-500 text-xs flex flex-col items-end">
           <div>SESSION: {{ sessionId }}</div>
           <div class="text-[10px] text-zinc-700">AUDIT_TRACE_ENABLED</div>
         </div>
      </div>

      <div class="flex-1 flex overflow-hidden">
        
        <!-- Steps List -->
        <div class="w-1/3 border-r border-zinc-800 p-8 flex flex-col gap-6 bg-zinc-900/30">
           @for (step of steps(); track step.id) {
             <div class="relative pl-6 transition-all duration-500" 
                  [class.opacity-30]="step.status === 'pending'"
                  [class.opacity-100]="step.status !== 'pending'"
                  [class.scale-105]="step.status === 'active'">
                
                <!-- Status Indicator Line -->
                <div class="absolute left-0 top-0 bottom-0 w-1 transition-colors duration-300"
                     [class.bg-zinc-700]="step.status === 'pending'"
                     [class.bg-orange-500]="step.status === 'active' || step.status === 'complete'"
                     [class.shadow-[0_0_10px_rgba(249,115,22,0.5)]]="step.status === 'active'"
                ></div>

                <div class="text-sm font-bold mb-1 text-zinc-200">{{ step.name }}</div>
                <div class="text-[10px] text-zinc-400 font-light tracking-wide">{{ step.details }}</div>
             </div>
           }
        </div>

        <!-- Terminal Output -->
        <div class="flex-1 bg-black p-8 font-mono text-xs text-zinc-300 overflow-hidden flex flex-col relative">
          
          <!-- Watermark -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <div class="text-9xl font-black text-white transform -rotate-12">CONFIDENTIAL</div>
          </div>

          <div class="mb-4 text-zinc-500 border-b border-zinc-800 pb-2 flex justify-between">
            <span>SYSTEM LOG // VERBOSE</span>
            <span class="text-orange-500/50">SECURE_ENCLAVE</span>
          </div>
          
          <div class="flex-1 overflow-y-auto flex flex-col-reverse relative z-10 scroll-smooth">
             @for (log of logs(); track $index) {
               <div class="mb-1 transition-opacity duration-300 animate-in slide-in-from-left-2 fade-in">
                 <span class="text-zinc-600 mr-2">[{{ log.time }}]</span> 
                 
                 @if (log.type === 'audit') {
                    <span class="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">AUDIT:</span>
                    <span class="text-zinc-500 ml-2 italic">{{ log.text }}</span>
                 } @else {
                    <span class="ml-2" [class.text-orange-400]="log.text.includes('WARN')">{{ log.text }}</span>
                 }
               </div>
             }
          </div>
        </div>
      </div>
      
      <!-- Completion State -->
       @if (isComplete()) {
         <div class="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-zinc-900 to-transparent flex items-end justify-center pb-12 animate-in fade-in slide-in-from-bottom-10 z-50">
            <div class="text-center">
              <div class="flex items-center justify-center gap-3 mb-4">
                 <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                 <span class="text-green-400 font-bold text-2xl tracking-widest">RENDER COMPLETE</span>
              </div>
              <p class="text-zinc-500 text-xs mb-6 uppercase tracking-wider">Asset finalized. Watermark embedded. License Signed.</p>
              
              <button (click)="resetApp()" class="px-8 py-3 bg-zinc-100 text-black hover:bg-white transition-all text-xs font-bold uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                Enter Playback
              </button>
            </div>
         </div>
       }

    </div>
  `
})
export class PipelineVisualizerComponent implements OnChanges {
  aiData = input<any>(null);
  startTrigger = input<boolean>(false);
  
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['startTrigger'] && changes['startTrigger'].currentValue === true) {
      this.runPipeline();
    }
  }

  private addLog(text: string, type: 'info' | 'audit' = 'info') {
    const time = new Date().toISOString().split('T')[1].slice(0, -1);
    this.logs.update(l => [...l, { time, text, type }]);
  }

  async runPipeline() {
    this.addLog('Init sequence started...', 'info');
    this.addLog(`Session ${this.sessionId} logged to secure ledger`, 'audit');
    this.addLog('GPU clusters allocated.', 'info');
    
    // Step 1: Sweep
    await this.processStep(0, 1500, ['Frame scan initiated', 'Target lock verified', 'Motion vectors extracted']);
    
    // Step 2: Geometry (Use AI Data)
    const geomDetails = this.aiData()?.geometry;
    const geomConf = geomDetails ? `Confidence: ${geomDetails.match_confidence}%` : 'Standard Alignment';
    this.updateStepDetails(1, geomConf);
    
    const aiLogs = this.aiData()?.logs || ['Mesh generated', 'Vertices aligned'];
    await this.processStep(1, 2000, ['building_mesh_v4...', ...aiLogs.slice(0, 2)]);
    
    // Step 3: Lighting (Use AI Data)
    const lighting = this.aiData()?.lighting;
    const lightInfo = lighting ? `Source: ${lighting.type} (${lighting.temperature}K)` : 'Estimating scene lux...';
    this.updateStepDetails(2, lightInfo);
    
    await this.processStep(2, 1800, ['Raycast probe active', `Light Vector: ${lighting?.direction || '[0,1,0]'}`, 'Subsurface scattering enabled']);
    
    // Step 4: Replacement
    this.addLog('Injecting identity_vault_01...', 'audit');
    await this.processStep(3, 2200, ['Injecting texture maps', 'Alpha blending edges', 'Hair occlusion calculated']);
    
    // Step 5: Sanity
    await this.processStep(4, 1500, ['Temporal denoiser running', 'Jitter reduction: 99.4%', 'Final composite ok']);
    this.addLog('Watermark #8849-221 embedded invisibly', 'audit');

    this.isComplete.set(true);
    this.addLog('PIPELINE FINISHED. ASSET SEALED.');
  }

  private async processStep(index: number, duration: number, stepLogs: string[]) {
    this.updateStepStatus(index, 'active');
    const interval = duration / stepLogs.length;
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

  private updateStepDetails(index: number, details: string) {
    this.steps.update(steps => {
      const newSteps = [...steps];
      newSteps[index] = { ...newSteps[index], details };
      return newSteps;
    });
  }

  resetApp() {
    window.location.reload(); 
  }
}