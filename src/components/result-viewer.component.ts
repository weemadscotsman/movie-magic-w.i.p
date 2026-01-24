import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-result-viewer',
  imports: [CommonModule],
  template: `
    <div class="h-full w-full bg-[#0A0F1A] text-[#00FF41] font-mono flex flex-col p-4 gap-4 animate-in fade-in duration-1000">
      
      <!-- Header -->
      <header class="flex justify-between items-center border border-[#00FF41]/30 bg-black/30 p-2">
        <div class="text-xs">
          <span class="text-white">CANN.ON.AI // RIGS SYSTEMS /</span>
          <span> DAD-OPS: UNIVERSAL MESH</span>
        </div>
        <div class="text-xs flex items-center gap-2 px-2 py-1 border border-[#00FF41]/50 bg-black/50">
          <span class="text-white">STATUS:</span>
          <span>NEURAL MESH MATCHED. PROJECTION ACTIVE.</span>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 border border-[#00FF41]/30 bg-black/30 p-4 relative flex items-center justify-center gap-16">
        
        <!-- Source Topology -->
        <div class="flex flex-col items-center gap-2">
           <div class="w-64 h-64 relative">
              <img [src]="identityImage()" alt="Source Topology" class="w-full h-full object-cover opacity-40 filter grayscale brightness-200 contrast-200">
              <!-- Point cloud effect -->
              <div class="absolute inset-0 bg-repeat bg-center" [style.background-image]="'radial-gradient(#00FF41 1px, transparent 1px)'" style="background-size: 5px 5px; mask-size: cover; -webkit-mask-size: cover;" [style.mask-image]="'url(' + identityImage() + ')'" [style.-webkit-mask-image]="'url(' + identityImage() + ')'"></div>
           </div>
           <div class="text-[10px] tracking-widest">SOURCE TOPOLOGY</div>
        </div>
        
        <!-- Rendered Result -->
        <div class="flex flex-col items-center gap-2">
           <div class="w-64 h-64 relative overflow-hidden group">
              @if (showMesh()) {
                <div class="absolute inset-0 bg-gradient-to-br from-cyan-500 via-purple-500 to-orange-500 animate-[spin_5s_linear_infinite]"></div>
                <img [src]="identityImage()" alt="Rendered Result" class="w-full h-full object-cover mix-blend-hard-light group-hover:mix-blend-overlay transition-all duration-300">
              } @else {
                 <img [src]="identityImage()" alt="Rendered Result" class="w-full h-full object-cover">
              }
              <div class="absolute inset-0 border-2 border-white/50"></div>
           </div>
           <div class="text-[10px] tracking-widest">RENDERED MESH</div>
        </div>
        
      </main>

      <!-- Footer Controls -->
      <footer class="flex justify-between items-center border border-[#00FF41]/30 bg-black/30 p-2">
        <div class="text-xs flex items-center gap-2 px-2 py-1 border border-[#00FF41]/50 bg-black/50">
           <div class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
           <span class="text-white">COMMS_LINK //</span>
           <span>OFFLINE</span>
           <span class="text-white ml-2">[ EXPAND ]</span>
        </div>

        <div class="flex items-center gap-4">
           <button (click)="showMesh.set(!showMesh())" class="px-4 py-2 border border-[#00FF41]/50 bg-black/50 text-xs hover:bg-[#00FF41] hover:text-black transition-colors">
              {{ showMesh() ? 'HIDE MESH' : 'SHOW MESH' }}
           </button>
           <button (click)="reset.emit()" class="px-4 py-2 border border-[#00FF41]/50 bg-[#00FF41]/80 text-black text-xs font-bold hover:bg-[#00FF41] transition-colors">
              FINISH & RESET
           </button>
        </div>
      </footer>

    </div>
  `
})
export class ResultViewerComponent {
  originalFrame = input<string | null>(null);
  identityImage = input<string | null>(null);
  aiData = input<any>(null);
  
  reset = output<void>();

  showMesh = signal(true);
}
