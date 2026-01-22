import { Component, ElementRef, ViewChild, output, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-stage',
  imports: [CommonModule],
  template: `
    <div class="relative w-full h-full bg-black flex items-center justify-center overflow-hidden border-b border-zinc-800 group font-mono">
      
      <!-- STATE: IDLE (No Package) -->
      @if (ingestState() === 'idle') {
        <div class="flex flex-col items-center gap-6 p-12 text-zinc-500 border border-zinc-800 bg-zinc-900/20 animate-in fade-in zoom-in duration-500">
          <div class="w-16 h-16 border-2 border-zinc-700 rounded-sm flex items-center justify-center mb-2">
             <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          </div>
          
          <div class="text-center space-y-2">
            <h3 class="text-zinc-300 font-bold tracking-widest text-sm">CINEMATIC INGEST SYSTEM</h3>
            <p class="text-[10px] text-zinc-600 max-w-xs mx-auto">
              Securely load studio-signed packages. <br>
              Validates license, role map, and substitution rules.
            </p>
          </div>

          <div class="flex flex-col gap-3 w-full max-w-[200px]">
             <label class="group relative px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-[10px] font-bold tracking-[0.2em] cursor-pointer transition-all border border-zinc-700 text-center uppercase overflow-hidden">
               <div class="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/10 transition-colors"></div>
               Load Local DCP
               <input type="file" accept="video/*" class="hidden" (change)="onFileSelected($event)">
             </label>
             
             <button (click)="loadDemo()" class="text-[9px] text-zinc-600 hover:text-orange-500 transition-colors uppercase tracking-wider flex items-center justify-center gap-2">
               <span>Initialize Demo Protocol</span>
               <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
             </button>
          </div>
        </div>
      }

      <!-- STATE: INGESTING (Analysis) -->
      @if (ingestState() === 'ingesting' || ingestState() === 'analyzing') {
         <div class="w-full max-w-lg p-8 font-mono text-xs relative">
            <!-- Progress Header -->
            <div class="flex justify-between items-end mb-2 text-orange-500">
               <span class="font-bold tracking-widest animate-pulse">
                 {{ ingestState() === 'ingesting' ? 'DECRYPTING PACKAGE' : 'GENERATING ROLE MAP' }}
               </span>
               <span>{{ ingestProgress() }}%</span>
            </div>

            <!-- Progress Bar -->
            <div class="w-full h-1 bg-zinc-800 mb-6 relative overflow-hidden">
               <div class="absolute top-0 left-0 h-full bg-orange-500 transition-all duration-200" [style.width.%]="ingestProgress()"></div>
            </div>

            <!-- Logs Terminal -->
            <div class="h-48 overflow-hidden flex flex-col-reverse border-l-2 border-zinc-800 pl-4">
               @for (log of ingestLogs(); track $index) {
                 <div class="mb-1 text-zinc-500 truncate">
                   <span class="text-zinc-700 mr-2">></span> {{ log }}
                 </div>
               }
            </div>
         </div>
      }

      <!-- STATE: READY (Video Player) -->
      @if (ingestState() === 'ready') {
        <div class="relative w-full h-full flex flex-col justify-center bg-black animate-in fade-in duration-1000">
          
          <video 
            #videoPlayer
            [src]="videoSrc()"
            crossorigin="anonymous"
            class="max-w-full max-h-full mx-auto object-contain"
            playsinline
            (loadedmetadata)="onMetadataLoaded()"
            (timeupdate)="onTimeUpdate()"
            (ended)="isPlaying.set(false)"
          ></video>

          <!-- Drawing Canvas Layer -->
          <canvas
            #drawCanvas
            class="absolute top-0 left-0 w-full h-full cursor-crosshair touch-none z-10"
            (mousedown)="startDrawing($event)"
            (mousemove)="draw($event)"
            (mouseup)="stopDrawing()"
            (mouseleave)="stopDrawing()"
          ></canvas>
          
          <!-- Meta Overlay (You are here) -->
          @if (showMetaOverlay()) {
            <div class="absolute right-8 top-24 p-4 text-right pointer-events-none animate-in fade-in">
               <div class="text-[9px] text-zinc-500 uppercase tracking-widest">Scene 04</div>
               <div class="text-2xl font-bold text-white uppercase tracking-wider mb-1">Bridge Assault</div>
               <div class="text-[9px] text-orange-500 uppercase tracking-widest">Hero Moment Detected</div>
            </div>
          }

          <!-- Role Map Overlay (Heads Up Display) -->
          @if (detectedRole()) {
            <div class="absolute top-8 left-8 p-4 bg-zinc-900/80 border-l-2 border-orange-500 backdrop-blur text-xs font-mono animate-in slide-in-from-left-4 fade-in z-30 pointer-events-none">
               <div class="text-zinc-500 text-[9px] uppercase tracking-widest mb-1">Role Map ID</div>
               <div class="text-orange-500 font-bold text-lg leading-none">{{ detectedRole() }}</div>
               <div class="text-zinc-400 mt-1">Confidence: 99.8%</div>
               <div class="text-[9px] text-zinc-600 mt-2">SWAP PERMISSION: GRANTED</div>
            </div>
          }
          
          <!-- Screenshot Flash -->
          @if (screenshotFlash()) {
            <div class="absolute inset-0 bg-white z-50 animate-[fadeOut_0.5s_ease-out_forwards]"></div>
          }

          <!-- Transport Controls (Overlay on Hover/Pause) -->
          <div class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-4 z-20">
             
             <!-- Scrubber Row -->
             <div class="flex items-center gap-4">
                <input 
                  type="range" 
                  class="flex-1 h-1 bg-zinc-700 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                  [min]="0" 
                  [max]="duration()" 
                  [value]="currentTime()"
                  (input)="seek($event)"
                >
             </div>

             <!-- Controls Row -->
             <div class="flex items-center justify-between">
                
                <!-- Playback Tools -->
                <div class="flex items-center gap-6">
                  <button (click)="togglePlay()" class="text-white hover:text-orange-500 transition-colors">
                    @if (isPlaying()) {
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    }
                  </button>

                  <div class="flex items-center gap-2">
                    <button (click)="skip(-5)" class="text-zinc-400 hover:text-white transition-colors p-1" title="Rewind 5s">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M9 12h.01"/></svg>
                    </button>
                    <button (click)="skip(5)" class="text-zinc-400 hover:text-white transition-colors p-1" title="Forward 5s">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M15 12h.01"/></svg>
                    </button>
                  </div>
                </div>

                <!-- Right Controls: Time, Meta, Camera -->
                <div class="flex items-center gap-6">
                   <span class="font-mono text-xs text-zinc-400 tracking-widest">{{ formatTime(currentTime()) }} / {{ formatTime(duration()) }}</span>

                   <button (click)="showMetaOverlay.set(!showMetaOverlay())" class="text-zinc-400 hover:text-white transition-colors" [class.text-orange-500]="showMetaOverlay()" title="Toggle Metadata Overlay">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                   </button>

                   <button (click)="takeSocialScreenshot()" class="text-zinc-400 hover:text-white transition-colors" title="Social Screenshot (No Video Export)">
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                   </button>
                   
                   <div class="h-4 w-px bg-zinc-700 mx-2"></div>

                   <div class="flex items-center gap-2 group/vol">
                      <button (click)="toggleMute()" class="text-zinc-400 hover:text-white transition-colors">
                        @if (isMuted() || volume() === 0) {
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><line x1="23" x2="1" y1="9" y2="15"/></svg>
                        } @else {
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                        }
                      </button>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1" 
                        [value]="isMuted() ? 0 : volume()"
                        (input)="setVolume($event)"
                        class="w-16 h-1 bg-zinc-700 appearance-none cursor-pointer rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-zinc-200 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-orange-500"
                      >
                   </div>
                </div>

             </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes fadeOut { from { opacity: 0.8; } to { opacity: 0; } }
  `]
})
export class VideoStageComponent implements OnDestroy {
  @ViewChild('videoPlayer') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('drawCanvas') canvasElement!: ElementRef<HTMLCanvasElement>;

  // Inputs/Outputs
  frameCaptured = output<string>();
  targetDeclared = output<boolean>();

  // State
  ingestState = signal<'idle' | 'ingesting' | 'analyzing' | 'ready'>('idle');
  ingestProgress = signal(0);
  ingestLogs = signal<string[]>([]);
  
  videoSrc = signal<string | null>(null);
  detectedRole = signal<string | null>(null);

  isPlaying = signal(false);
  currentTime = signal(0);
  duration = signal(0);
  volume = signal(1);
  isMuted = signal(false);
  
  showMetaOverlay = signal(false);
  screenshotFlash = signal(false);
  
  // Drawing State
  private isDrawing = false;
  private ctx: CanvasRenderingContext2D | null = null;
  private tempSrc: string | null = null;

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.tempSrc = URL.createObjectURL(file);
      this.runIngestSequence();
    }
  }

  loadDemo() {
    this.tempSrc = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';
    this.runIngestSequence();
  }

  // --- Ingest System ---
  private async runIngestSequence() {
    this.ingestState.set('ingesting');
    this.ingestProgress.set(0);
    this.ingestLogs.set([]);

    // Phase 1: Upload/Decrypt
    await this.logDelay('INIT_SECURE_HANDSHAKE...', 300);
    await this.logDelay('DECRYPTING_PACKETS [AES-256]...', 600);
    await this.simulateProgress(30, 20);
    
    // Phase 2: Analysis
    this.ingestState.set('analyzing');
    await this.logDelay('VALIDATING_DIGITAL_SIGNATURES...', 400);
    await this.logDelay('PARSING_SCENE_METADATA...', 500);
    await this.simulateProgress(60, 20);
    await this.logDelay('BUILDING_SCENE_GRAPH...', 400);
    await this.logDelay('DETECTING_SWAPPABLE_ROLES...', 800);
    await this.simulateProgress(100, 10);
    await this.logDelay('ROLE_MAP_GENERATED: 4 IDENTITIES FOUND.', 200);

    // Ready
    if (this.tempSrc) {
      this.videoSrc.set(this.tempSrc);
      this.tempSrc = null; // consume
      this.ingestState.set('ready');
    }
  }

  private async logDelay(msg: string, ms: number) {
    this.ingestLogs.update(logs => [msg, ...logs]);
    await new Promise(r => setTimeout(r, ms));
  }

  private async simulateProgress(target: number, stepTime: number) {
    while (this.ingestProgress() < target) {
      this.ingestProgress.update(v => Math.min(v + Math.random() * 5, target));
      await new Promise(r => setTimeout(r, stepTime));
    }
  }

  // --- Playback Logic ---

  onMetadataLoaded() {
    this.duration.set(this.videoElement.nativeElement.duration);
    this.initCanvas();
  }

  onTimeUpdate() {
    if (this.videoElement?.nativeElement) {
      this.currentTime.set(this.videoElement.nativeElement.currentTime);
    }
  }

  togglePlay() {
    if (!this.videoElement) return;
    const video = this.videoElement.nativeElement;
    if (video.paused) {
      video.play();
      this.isPlaying.set(true);
      this.clearCanvas(); // Clear drawing on play
      this.targetDeclared.emit(false);
      this.detectedRole.set(null); // Clear role
    } else {
      video.pause();
      this.isPlaying.set(false);
    }
  }

  seek(event: Event) {
    const time = Number((event.target as HTMLInputElement).value);
    if (this.videoElement) {
      this.videoElement.nativeElement.currentTime = time;
      this.currentTime.set(time);
    }
  }

  skip(seconds: number) {
    if (this.videoElement) {
      this.videoElement.nativeElement.currentTime += seconds;
    }
  }

  setVolume(event: Event) {
    const vol = Number((event.target as HTMLInputElement).value);
    if (this.videoElement) {
      this.videoElement.nativeElement.volume = vol;
      this.volume.set(vol);
      this.isMuted.set(vol === 0);
    }
  }

  toggleMute() {
    if (this.videoElement) {
      if (this.isMuted()) {
        this.videoElement.nativeElement.volume = this.volume();
        this.isMuted.set(false);
      } else {
        this.volume.set(this.videoElement.nativeElement.volume);
        this.videoElement.nativeElement.volume = 0;
        this.isMuted.set(true);
      }
    }
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  takeSocialScreenshot() {
    if (!this.videoElement) return;
    
    // Trigger visual feedback
    this.screenshotFlash.set(true);
    setTimeout(() => this.screenshotFlash.set(false), 500);

    // Actual Capture Logic
    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // Draw frame
    ctx?.drawImage(video, 0, 0);
    
    // Draw Overlay Watermark (System 6 Rule: "social screenshots only")
    if (ctx) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(20, canvas.height - 60, 300, 40);
        ctx.fillStyle = "#fff";
        ctx.font = "20px monospace";
        ctx.fillText("CINEMARIG // LICENSED VIEW", 30, canvas.height - 35);
    }

    // Download simulation
    const link = document.createElement('a');
    link.download = `cinemarig_social_${Date.now()}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.85);
    link.click();
  }

  // --- Drawing Logic ---

  private initCanvas() {
    setTimeout(() => {
      if (this.canvasElement && this.videoElement) {
        const canvas = this.canvasElement.nativeElement;
        const video = this.videoElement.nativeElement;
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;
        this.ctx = canvas.getContext('2d');
        if (this.ctx) {
          this.ctx.lineWidth = 3;
          this.ctx.strokeStyle = '#f97316'; // Orange-500
          this.ctx.lineCap = 'round';
          this.ctx.shadowBlur = 10;
          this.ctx.shadowColor = '#f97316';
        }
      }
    }, 100);
  }

  startDrawing(e: MouseEvent) {
    if (this.isPlaying()) {
      this.togglePlay(); // Pause to draw
    }
    this.clearCanvas();
    this.detectedRole.set(null);
    this.isDrawing = true;
    this.targetDeclared.emit(false);
    
    const rect = this.canvasElement.nativeElement.getBoundingClientRect();
    this.ctx?.beginPath();
    this.ctx?.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  draw(e: MouseEvent) {
    if (!this.isDrawing || !this.ctx) return;
    const rect = this.canvasElement.nativeElement.getBoundingClientRect();
    this.ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    this.ctx.stroke();
  }

  stopDrawing() {
    if (!this.isDrawing) return;
    this.isDrawing = false;
    this.ctx?.closePath();
    
    // Simulate Role Map Lookup
    setTimeout(() => {
        const id = Math.floor(Math.random() * 4) + 1;
        this.detectedRole.set(`ROLE_ID_0${id}`);
        this.targetDeclared.emit(true);
        this.captureFrame();
    }, 500);
  }

  private clearCanvas() {
    if (this.ctx && this.canvasElement) {
      this.ctx.clearRect(0, 0, this.canvasElement.nativeElement.width, this.canvasElement.nativeElement.height);
    }
  }

  private captureFrame() {
    if (!this.videoElement) return;
    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    this.frameCaptured.emit(dataUrl);
  }

  ngOnDestroy() {
    if(this.videoSrc()){
      URL.revokeObjectURL(this.videoSrc()!);
    }
    if(this.tempSrc) {
       URL.revokeObjectURL(this.tempSrc);
    }
  }
}