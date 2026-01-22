import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gateway',
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center font-mono text-zinc-400 p-4 select-none cursor-default">
      
      <!-- Protocol Header -->
      <div class="mb-12 flex items-center gap-3 opacity-50">
         <div class="w-6 h-6 bg-zinc-800 rounded-sm"></div>
         <h1 class="tracking-[0.5em] text-xs font-bold">PROOF OF WATCH PROTOCOL</h1>
      </div>

      <!-- Scanner Box -->
      <div class="w-full max-w-sm border border-zinc-800 bg-zinc-900/20 p-1 flex flex-col items-center gap-6 relative overflow-hidden group">
        
        <div class="w-full h-full p-8 border border-zinc-800/50 bg-black flex flex-col items-center relative">
          <!-- Scan Line Animation -->
          @if (isScanning()) {
            <div class="absolute top-0 left-0 w-full h-1 bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.8)] z-10 animate-[scan_2s_linear_infinite]"></div>
            <div class="absolute inset-0 bg-orange-500/5 z-0"></div>
          }

          <!-- State 1: IDLE -->
          @if (status() === 'idle') {
            <div class="w-32 h-32 border-2 border-dashed border-zinc-700 rounded flex items-center justify-center mb-6 opacity-80">
              <svg class="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4"></path></svg>
            </div>
            <p class="text-[10px] uppercase tracking-widest text-center text-zinc-500 mb-6">
              Scan Cinema Ticket<br>To Unlock Rig
            </p>
            <button (click)="startScan()" class="px-8 py-3 bg-zinc-100 hover:bg-white text-black font-bold text-[10px] tracking-[0.2em] transition-colors w-full uppercase">
              Initiate Scan
            </button>
          }

          <!-- State 2: SCANNING -->
          @if (status() === 'scanning') {
            <div class="flex flex-col items-center justify-center h-48 gap-6 w-full">
               <div class="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
               <div class="flex flex-col items-center gap-1">
                 <div class="text-[10px] text-orange-500 font-bold tracking-widest animate-pulse">DECRYPTING TOKEN</div>
                 <div class="text-[9px] text-zinc-600 font-mono">HASH: {{ randomHash() }}</div>
               </div>
            </div>
          }

          <!-- State 3: VERIFIED -->
          @if (status() === 'verified') {
            <div class="flex flex-col items-center justify-center h-full w-full animate-in fade-in zoom-in duration-300">
               <div class="text-green-500 mb-4">
                 <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
               </div>
               <div class="text-sm text-zinc-100 font-bold tracking-widest mb-1">ACCESS GRANTED</div>
               <div class="text-[9px] text-zinc-500 uppercase tracking-wider mb-8 border-b border-zinc-800 pb-2">
                 Lic: TEARS_OF_STEEL_VALIDATED
               </div>
               
               <button (click)="enter.emit()" class="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-[10px] tracking-[0.2em] transition-colors w-full shadow-[0_0_20px_rgba(22,163,74,0.4)] uppercase">
                 Launch Identity Rig
               </button>
            </div>
          }
        </div>
      </div>

      <!-- Compliance Footer -->
      <div class="mt-16 flex flex-col gap-2 text-[9px] text-zinc-700 text-center leading-relaxed">
        <div class="flex gap-4 justify-center uppercase tracking-wider opacity-50">
          <span>Local Device Only</span>
          <span>•</span>
          <span>No Cloud Export</span>
          <span>•</span>
          <span>Studio Audited</span>
        </div>
        <div>SESSION ID: {{ sessionId }}</div>
      </div>

    </div>
  `,
  styles: [`
    @keyframes scan {
      0% { top: 0%; opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { top: 100%; opacity: 0; }
    }
  `]
})
export class GatewayComponent {
  enter = output();
  status = signal<'idle' | 'scanning' | 'verified'>('idle');
  isScanning = signal(false);
  
  sessionId = Math.random().toString(36).substring(2, 10).toUpperCase();
  randomHash = signal('...');

  constructor() {
    setInterval(() => {
      if(this.isScanning()) {
        this.randomHash.set(Math.random().toString(36).substring(2, 15).toUpperCase());
      }
    }, 100);
  }

  startScan() {
    this.status.set('scanning');
    this.isScanning.set(true);
    
    // Simulate network latency/verification
    setTimeout(() => {
      this.status.set('verified');
      this.isScanning.set(false);
    }, 2500);
  }
}