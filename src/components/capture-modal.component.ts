import { Component, ElementRef, ViewChild, output, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-capture-modal',
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md font-mono select-none">
      
      <div class="w-full max-w-lg bg-zinc-900 border border-zinc-700 shadow-2xl flex flex-col relative overflow-hidden">
        
        <!-- Vault Header -->
        <div class="h-10 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4">
          <div class="flex items-center gap-2 text-zinc-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            <span class="text-[10px] tracking-widest font-bold">IDENTITY VAULT // LOCAL_ONLY</span>
          </div>
          <button (click)="close.emit()" class="text-zinc-600 hover:text-zinc-300">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Main Viewport -->
        <div class="relative bg-black aspect-[4/5] group overflow-hidden">
          
          <!-- SCANNER VIEW -->
          @if (vaultState() === 'scanning') {
            <video #videoElement autoplay playsinline muted class="w-full h-full object-cover mirror opacity-80"></video>
            
            <!-- Face Mesh Overlay (SVG) -->
            <div class="absolute inset-0 pointer-events-none opacity-50">
               <svg class="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                 <path d="M30,30 Q50,10 70,30 T70,70 Q50,90 30,70 T30,30" fill="none" stroke="#ea580c" stroke-width="0.2" stroke-dasharray="1,1" class="animate-pulse"/>
                 <circle cx="35" cy="45" r="3" fill="none" stroke="#ea580c" stroke-width="0.2" />
                 <circle cx="65" cy="45" r="3" fill="none" stroke="#ea580c" stroke-width="0.2" />
                 <path d="M40,80 Q50,85 60,80" fill="none" stroke="#ea580c" stroke-width="0.2" />
                 
                 <!-- Dynamic scan line -->
                 <line x1="0" y1="50" x2="100" y2="50" stroke="#ea580c" stroke-width="0.5" class="animate-[scan_3s_linear_infinite]" />
               </svg>
            </div>

            <!-- Hint -->
            <div class="absolute bottom-6 left-0 right-0 text-center">
              <div class="inline-block px-3 py-1 bg-black/50 border border-orange-500/30 text-orange-500 text-[10px] tracking-wider uppercase backdrop-blur-sm">
                Align Face Within Grid
              </div>
            </div>
          }

          <!-- PROCESSING VIEW -->
          @if (vaultState() === 'processing' || vaultState() === 'encrypting') {
            <img [src]="capturedImage()" class="w-full h-full object-cover opacity-50 filter grayscale contrast-125">
            
            <!-- Technical Overlay -->
            <div class="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black via-transparent to-transparent">
               <div class="space-y-2">
                 <!-- Progress Bar -->
                 <div class="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                   <div class="h-full bg-orange-500 transition-all duration-300" [style.width.%]="processProgress()"></div>
                 </div>
                 
                 <div class="flex justify-between items-center text-[10px] font-bold tracking-widest">
                   <span class="text-orange-500 animate-pulse">{{ processingStep() }}</span>
                   <span class="text-zinc-500">{{ processProgress() }}%</span>
                 </div>
                 
                 <!-- Log output -->
                 <div class="h-24 overflow-hidden flex flex-col-reverse text-[9px] text-zinc-600 border-l border-zinc-800 pl-2 font-mono leading-tight">
                   @for (log of logs(); track $index) {
                     <div>> {{ log }}</div>
                   }
                 </div>
               </div>
            </div>
          }

          <!-- LOCKED/VAULTED VIEW -->
          @if (vaultState() === 'vaulted') {
             <div class="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900">
                <div class="w-32 h-32 rounded-full border-4 border-zinc-800 flex items-center justify-center relative mb-6">
                   <div class="absolute inset-0 border-4 border-green-500 rounded-full animate-[ping_3s_infinite_opacity-0]"></div>
                   <img [src]="capturedImage()" class="w-full h-full object-cover rounded-full opacity-50 mix-blend-luminosity">
                   <div class="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
                   <svg class="w-12 h-12 text-green-500 absolute bottom-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                
                <h3 class="text-zinc-100 font-bold tracking-[0.2em] mb-1">IDENTITY SECURED</h3>
                <p class="text-zinc-600 text-[10px] uppercase tracking-wider mb-8">Vault ID: {{ vaultId }}</p>

                <div class="w-64 bg-zinc-950 border border-zinc-800 p-4 text-[9px] text-zinc-500 font-mono space-y-2">
                   <div class="flex justify-between"><span>Encryption</span> <span class="text-zinc-300">AES-256-GCM</span></div>
                   <div class="flex justify-between"><span>Storage</span> <span class="text-zinc-300">Local Memory</span></div>
                   <div class="flex justify-between"><span>Export</span> <span class="text-red-900">DISABLED</span></div>
                </div>
             </div>
          }

        </div>

        <!-- Controls -->
        <div class="p-4 bg-zinc-900">
           @if (vaultState() === 'scanning') {
             <div class="flex gap-2">
               <button 
                 (click)="capture()"
                 class="flex-1 py-4 bg-zinc-100 hover:bg-white text-black font-bold tracking-[0.2em] text-xs transition-colors uppercase"
               >
                 Scan Topology
               </button>
               <label class="px-4 py-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 cursor-pointer border border-zinc-700 flex items-center justify-center">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                 <input type="file" accept="image/*" class="hidden" (change)="onFileSelected($event)">
               </label>
             </div>
           }

           @if (vaultState() === 'vaulted') {
             <div class="flex gap-2">
               <button (click)="reset()" class="px-6 py-3 border border-zinc-700 text-zinc-400 hover:text-white text-[10px] uppercase tracking-wider">
                 Discard
               </button>
               <button (click)="confirm()" class="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold tracking-[0.2em] text-xs uppercase shadow-[0_0_15px_rgba(22,163,74,0.3)]">
                 Link to Rig
               </button>
             </div>
           }
           
           @if (vaultState() === 'processing' || vaultState() === 'encrypting') {
              <div class="text-center text-[10px] text-zinc-600 animate-pulse uppercase tracking-widest py-3">
                System Busy...
              </div>
           }
        </div>

      </div>
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
  `]
})
export class CaptureModalComponent implements OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  
  imageConfirmed = output<string>();
  close = output<void>();
  
  vaultState = signal<'scanning' | 'processing' | 'encrypting' | 'vaulted'>('scanning');
  capturedImage = signal<string | null>(null);
  
  // Processing Simulation State
  processProgress = signal(0);
  processingStep = signal('IDLE');
  logs = signal<string[]>([]);
  vaultId = Math.random().toString(16).substring(2, 10).toUpperCase();

  stream: MediaStream | null = null;

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

  async runVaultSequence() {
    this.vaultState.set('processing');
    
    // Phase 1: Analysis
    this.processingStep.set('MAPPING TOPOLOGY');
    await this.simulateLogs(2000, [
       'Initializing landmarks...',
       'Detecting jawline vector...',
       'Eye distance measured: 64mm',
       'Skin texture analysis complete'
    ]);

    // Phase 2: Feature Extraction
    this.processingStep.set('EXTRACTING VECTORS');
    this.processProgress.set(50);
    await this.simulateLogs(1500, [
        'Generating FaceNet embeddings...',
        'Checking expression neutral...',
        'Identity confidence: 98.7%',
    ]);

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

    this.processProgress.set(100);
    this.vaultState.set('vaulted');
  }

  async simulateLogs(duration: number, logLines: string[]) {
     const step = duration / logLines.length;
     for (const line of logLines) {
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