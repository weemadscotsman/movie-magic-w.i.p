import { Component, ElementRef, ViewChild, output, signal, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../services/settings.service';
import { SettingsPanelComponent } from './settings-panel.component';

@Component({
  selector: 'app-capture-modal',
  imports: [CommonModule, SettingsPanelComponent],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md font-mono select-none">
      
      <div class="w-full max-w-2xl bg-zinc-900 border border-zinc-700 shadow-2xl flex flex-col relative overflow-hidden transition-all duration-500" [class.max-w-4xl]="calibrationMode()">
        
        <!-- Vault Header -->
        <div class="h-12 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-6">
          <div class="flex items-center gap-3 text-zinc-400">
            <div class="w-2 h-2 bg-orange-500 rounded-full animate-pulse" *ngIf="vaultState() === 'scanning'"></div>
            <span class="text-[11px] tracking-[0.2em] font-bold text-zinc-200">IDENTITY VAULT // INGESTION</span>
          </div>
          
          <div class="flex items-center gap-6">
             <button (click)="calibrationMode.set(!calibrationMode())" class="text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2" [class.text-orange-500]="calibrationMode()" [class.text-zinc-600]="!calibrationMode()" [disabled]="vaultState() !== 'scanning'">
               <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
               CALIBRATE
             </button>

             <div class="h-4 w-px bg-zinc-800"></div>

             <button (click)="toggleSettings()" class="text-[9px] text-zinc-500 hover:text-white uppercase tracking-widest flex items-center gap-2">
               CONFIG
             </button>
             
             <button (click)="close.emit()" class="text-zinc-600 hover:text-white transition-colors">
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
             </button>
          </div>
        </div>

        <div class="flex h-[500px]">
          
          <!-- Main Viewport -->
          <div class="flex-1 relative bg-black group overflow-hidden border-r border-zinc-800">
            
            <!-- SCANNER VIEW -->
            @if (vaultState() === 'scanning') {
              <video #videoElement autoplay playsinline muted class="w-full h-full object-cover mirror opacity-80 transition-opacity duration-300" [style.filter]="'contrast(' + (1 + lidarSensitivity()/100) + ')'"></video>
              
              <!-- Face Mesh Overlay (SVG) -->
              <div class="absolute inset-0 pointer-events-none opacity-60">
                 <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                   <!-- Grid -->
                   <defs>
                     <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                       <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#ea580c" stroke-width="0.1" [attr.stroke-opacity]="gridOpacity()"/>
                     </pattern>
                   </defs>
                   <rect width="100%" height="100%" fill="url(#grid)" />

                   <path d="M30,30 Q50,10 70,30 T70,70 Q50,90 30,70 T30,30" fill="none" stroke="#ea580c" stroke-width="0.3" stroke-dasharray="2,2" class="animate-pulse"/>
                   
                   <!-- Targeting Reticle -->
                   <line x1="50" y1="20" x2="50" y2="25" stroke="#ea580c" stroke-width="0.5" />
                   <line x1="50" y1="75" x2="50" y2="80" stroke="#ea580c" stroke-width="0.5" />
                   <line x1="20" y1="50" x2="25" y2="50" stroke="#ea580c" stroke-width="0.5" />
                   <line x1="75" y1="50" x2="80" y2="50" stroke="#ea580c" stroke-width="0.5" />

                   <!-- Dynamic scan line -->
                   <line x1="0" y1="50" x2="100" y2="50" stroke="#ea580c" stroke-width="0.5" class="animate-[scan_2s_linear_infinite]" />
                 </svg>
              </div>

              <!-- Hint -->
              <div class="absolute bottom-6 left-0 right-0 text-center">
                <div class="inline-block px-4 py-1 bg-black/80 border border-orange-900/50 text-orange-500 text-[10px] tracking-wider uppercase backdrop-blur-md rounded-full shadow-[0_0_15px_rgba(234,88,12,0.2)]">
                  Align Face Within Reticle
                </div>
              </div>
            }

            <!-- PROCESSING VIEW -->
            @if (vaultState() === 'processing' || vaultState() === 'encrypting') {
              <img [src]="capturedImage()" class="w-full h-full object-cover opacity-50 filter grayscale contrast-125 cursor-pointer" title="Click to Fast-Forward" (click)="finishProcessingInstant()">
              
              <!-- Technical Overlay -->
              <div class="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none">
                 <div class="space-y-4">
                   <!-- Progress Bar -->
                   <div>
                     <div class="flex justify-between items-center text-[10px] font-bold tracking-widest mb-1">
                       <span class="text-orange-500 animate-pulse">{{ processingStep() }}</span>
                       <span class="text-zinc-500">{{ processProgress() }}%</span>
                     </div>
                     <div class="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                       <div class="h-full bg-orange-500 transition-all duration-100 ease-linear" [style.width.%]="processProgress()"></div>
                     </div>
                   </div>
                   
                   <!-- Log output -->
                   <div class="h-24 overflow-hidden flex flex-col-reverse text-[10px] text-zinc-500 border-l-2 border-zinc-800 pl-3 font-mono leading-relaxed bg-black/50 p-2">
                     @for (log of logs(); track $index) {
                       <div><span class="text-orange-900 mr-2">>></span>{{ log }}</div>
                     }
                   </div>
                 </div>
              </div>
            }

            <!-- LOCKED/VAULTED VIEW -->
            @if (vaultState() === 'vaulted') {
               <div class="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 animate-in fade-in zoom-in duration-500">
                  <div class="w-40 h-40 rounded-full border-4 border-zinc-800 flex items-center justify-center relative mb-8 group">
                     <div class="absolute inset-0 border-4 border-green-500 rounded-full animate-[ping_3s_infinite_opacity-0]"></div>
                     <img [src]="capturedImage()" class="w-full h-full object-cover rounded-full opacity-60 mix-blend-luminosity grayscale group-hover:grayscale-0 transition-all duration-500">
                     <div class="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
                     <svg class="w-12 h-12 text-green-500 absolute bottom-4 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  </div>
                  
                  <h3 class="text-zinc-100 font-bold tracking-[0.3em] text-lg mb-2 text-shadow">IDENTITY SECURED</h3>
                  <p class="text-zinc-600 text-[10px] uppercase tracking-wider mb-8 font-mono bg-zinc-950 px-3 py-1 rounded border border-zinc-800">Vault ID: {{ vaultId }}</p>

                  <div class="w-72 bg-zinc-950 border-l-2 border-green-900 p-4 text-[10px] text-zinc-500 font-mono space-y-2 relative overflow-hidden">
                     <div class="absolute top-0 right-0 p-1 text-green-900 opacity-20">
                        <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                     </div>
                     <div class="flex justify-between border-b border-zinc-900 pb-1"><span>Encryption</span> <span class="text-zinc-300">AES-256-GCM</span></div>
                     <div class="flex justify-between border-b border-zinc-900 pb-1"><span>Storage</span> <span class="text-zinc-300">Local Volatile Memory</span></div>
                     <div class="flex justify-between"><span>Rights</span> <span class="text-zinc-300">Single Session Use</span></div>
                  </div>
               </div>
            }
          </div>

          <!-- Calibration Sidebar (Conditional) -->
          @if (calibrationMode()) {
            <div class="w-64 bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col gap-8 animate-in slide-in-from-right duration-300 relative z-10">
               <div>
                 <h4 class="text-orange-500 text-[10px] font-bold tracking-widest uppercase mb-4 border-b border-zinc-800 pb-2">Sensor Config</h4>
                 
                 <!-- Lidar Sensitivity -->
                 <div class="mb-6">
                   <div class="flex justify-between mb-2">
                     <label class="text-zinc-500 text-[9px] uppercase">Lidar Gain</label>
                     <span class="text-zinc-300 text-[9px] font-mono">{{ lidarSensitivity() }}%</span>
                   </div>
                   <input type="range" min="0" max="100" [value]="lidarSensitivity()" (input)="updateLidar($event)" class="w-full h-1 bg-zinc-800 appearance-none rounded-lg cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-orange-600 [&::-webkit-slider-thumb]:rounded-full">
                 </div>

                 <!-- Grid Density -->
                 <div class="mb-6">
                   <div class="flex justify-between mb-2">
                     <label class="text-zinc-500 text-[9px] uppercase">Mesh Density</label>
                     <span class="text-zinc-300 text-[9px] font-mono">{{ gridOpacity() * 100 | number:'1.0-0' }}%</span>
                   </div>
                   <input type="range" min="0" max="1" step="0.1" [value]="gridOpacity()" (input)="updateGrid($event)" class="w-full h-1 bg-zinc-800 appearance-none rounded-lg cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-orange-600 [&::-webkit-slider-thumb]:rounded-full">
                 </div>
               </div>

               <!-- Advanced Import -->
               <div>
                  <h4 class="text-zinc-400 text-[10px] font-bold tracking-widest uppercase mb-4 border-b border-zinc-800 pb-2">Manual Ingest</h4>
                  <label class="block w-full aspect-video border border-dashed border-zinc-800 rounded bg-zinc-900/50 hover:bg-zinc-800/50 hover:border-zinc-600 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group">
                     <svg class="w-6 h-6 text-zinc-700 group-hover:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                     <div class="text-[9px] text-zinc-600 uppercase tracking-wide group-hover:text-zinc-400">Upload RAW / JPG</div>
                     <input type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
                  </label>
               </div>
            </div>
          }

        </div>

        <!-- Footer Controls -->
        <div class="p-4 bg-zinc-900 border-t border-zinc-800 flex gap-2">
           @if (vaultState() === 'scanning') {
               <button 
                 (click)="capture()"
                 class="flex-1 py-4 bg-zinc-100 hover:bg-white text-black font-bold tracking-[0.2em] text-xs transition-colors uppercase shadow-[0_0_15px_rgba(255,255,255,0.1)]"
               >
                 Initiate Scan Sequence
               </button>
           }

           @if (vaultState() === 'vaulted') {
               <button (click)="reset()" class="w-32 py-4 border border-zinc-700 text-zinc-400 hover:text-white text-[10px] uppercase tracking-wider hover:bg-zinc-800 transition-colors">
                 Discard
               </button>
               <button (click)="confirm()" class="flex-1 py-4 bg-green-600 hover:bg-green-500 text-white font-bold tracking-[0.2em] text-xs uppercase shadow-[0_0_15px_rgba(22,163,74,0.3)] transition-all transform hover:scale-[1.01]">
                 Link Identity to Rig
               </button>
           }
           
           @if (vaultState() === 'processing' || vaultState() === 'encrypting') {
              <div class="flex-1 flex items-center justify-center">
                 <button (click)="finishProcessingInstant()" class="text-[9px] text-zinc-500 hover:text-orange-500 animate-pulse uppercase tracking-widest py-3 hover:underline">
                   Processing Identity... (Click to Skip)
                 </button>
              </div>
           }
        </div>

      </div>

      <!-- Settings Overlay (Z-Index Managed) -->
      @if (showSettings()) {
        <app-settings-panel (close)="toggleSettings()"></app-settings-panel>
      }

    </div>
  `,
  styles: [`
    .mirror { transform: scaleX(-1); }
    @keyframes scan {
      0% { transform: translateY(0); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { transform: translateY(100%); opacity: 0; }
    }
    .text-shadow { text-shadow: 0 0 10px rgba(0,0,0,0.8); }
  `]
})
export class CaptureModalComponent implements OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  
  settings = inject(SettingsService);

  imageConfirmed = output<string>();
  close = output<void>();
  
  vaultState = signal<'scanning' | 'processing' | 'encrypting' | 'vaulted'>('scanning');
  capturedImage = signal<string | null>(null);
  showSettings = signal(false);
  calibrationMode = signal(false);
  
  // Calibration State
  lidarSensitivity = signal(75);
  gridOpacity = signal(0.3);

  // Processing Simulation State
  processProgress = signal(0);
  processingStep = signal('IDLE');
  logs = signal<string[]>([]);
  vaultId = Math.random().toString(16).substring(2, 10).toUpperCase();

  stream: MediaStream | null = null;
  private skipFlag = false;

  async ngOnInit() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (this.videoElement) {
        this.videoElement.nativeElement.srcObject = this.stream;
      }
    } catch (e) {
      console.warn('Camera access denied or unavailable', e);
    }
  }

  ngAfterViewInit() {
    if(this.stream && this.videoElement) {
       this.videoElement.nativeElement.srcObject = this.stream;
    }
  }

  toggleSettings() {
    this.showSettings.update(v => !v);
  }

  updateLidar(e: Event) {
    this.lidarSensitivity.set(Number((e.target as HTMLInputElement).value));
  }

  updateGrid(e: Event) {
    this.gridOpacity.set(Number((e.target as HTMLInputElement).value));
  }

  async capture() {
    if (!this.videoElement) return;
    
    // 1. Grab Frame
    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.translate(canvas.width, 0);
    ctx?.scale(-1, 1);
    
    // Apply simulated sensitivity to image brightness/contrast logic
    // (Visual only via CSS on video, but let's just grab the raw frame for simplicity)
    ctx?.drawImage(video, 0, 0);
    
    this.capturedImage.set(canvas.toDataURL('image/jpeg', 0.9));
    
    // Stop Camera
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }

    // 2. Start Vault Sequence
    await this.runVaultSequence();
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          this.capturedImage.set(e.target.result as string);
          await this.runVaultSequence();
        }
      };
      reader.readAsDataURL(file);
    }
  }

  finishProcessingInstant() {
    this.skipFlag = true;
  }

  async runVaultSequence() {
    this.skipFlag = false;
    this.vaultState.set('processing');
    
    if (this.settings.systemConfig().skipAnimations) {
        this.vaultState.set('vaulted');
        this.processProgress.set(100);
        return;
    }

    // Phase 1: Analysis
    this.processingStep.set('MAPPING TOPOLOGY');
    await this.simulateLogs(2000, [
       'Initializing landmarks...',
       `Lidar Sensitivity: ${this.lidarSensitivity()}%`,
       'Detecting jawline vector...',
       'Eye distance measured: 64mm',
       'Skin texture analysis complete'
    ]);
    if (this.skipFlag) { this.completeSequence(); return; }

    // Phase 2: Feature Extraction
    this.processingStep.set('EXTRACTING VECTORS');
    this.processProgress.set(50);
    await this.simulateLogs(1500, [
        'Generating FaceNet embeddings...',
        'Checking expression neutral...',
        'Identity confidence: 98.7%',
    ]);
    if (this.skipFlag) { this.completeSequence(); return; }

    // Phase 3: Encryption
    this.vaultState.set('encrypting');
    this.processingStep.set('ENCRYPTING VAULT');
    this.processProgress.set(80);
    await this.simulateLogs(1500, [
        'Hashing biometric data...',
        'Generating local private key...',
        'Encrypting payload (AES-256)...',
        'Writing to secure memory...'
    ]);

    this.completeSequence();
  }

  private completeSequence() {
    this.processProgress.set(100);
    this.vaultState.set('vaulted');
  }

  async simulateLogs(duration: number, logLines: string[]) {
     const step = duration / logLines.length;
     for (const line of logLines) {
       if (this.skipFlag) return;
       this.logs.update(l => [line, ...l]);
       // increment progress slightly randomly
       this.processProgress.update(p => Math.min(p + 5, 99));
       await new Promise(r => setTimeout(r, step));
     }
  }

  reset() {
    this.vaultState.set('scanning');
    this.capturedImage.set(null);
    this.logs.set([]);
    this.processProgress.set(0);
    this.ngOnInit(); // Restart camera
  }

  confirm() {
    if (this.capturedImage()) {
      this.imageConfirmed.emit(this.capturedImage()!);
      this.close.emit();
    }
  }

  ngOnDestroy() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }
}