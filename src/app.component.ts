import { Component, signal, ViewChild, ElementRef, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  
  // UI State
  stream: MediaStream | null = null;
  activeTab = signal<'library' | 'tuning'>('library');
  selectedPreset = signal<string | null>(null);

  // Simulation State
  logs = signal<string[]>([]);
  faceDetected = signal(false);
  meshPoints = signal<{x: number, y: number}[]>([]);
  
  private logInterval: any;
  
  // Pre-defined, centered face mesh data (coordinates in %)
  private readonly MESH_DATA = [
    // Jawline
    { x: 35, y: 75 }, { x: 40, y: 78 }, { x: 45, y: 80 }, { x: 50, y: 81 }, { x: 55, y: 80 }, { x: 60, y: 78 }, { x: 65, y: 75 },
    // Left Eyebrow
    { x: 38, y: 38 }, { x: 41, y: 36 }, { x: 44, y: 36 }, { x: 47, y: 37 },
    // Right Eyebrow
    { x: 53, y: 37 }, { x: 56, y: 36 }, { x: 59, y: 36 }, { x: 62, y: 38 },
    // Nose Bridge
    { x: 50, y: 40 }, { x: 50, y: 45 }, { x: 50, y: 50 },
    // Nose Bottom
    { x: 47, y: 55 }, { x: 50, y: 56 }, { x: 53, y: 55 },
    // Left Eye
    { x: 40, y: 45 }, { x: 43, y: 44 }, { x: 46, y: 45 }, { x: 43, y: 46 },
    // Right Eye
    { x: 54, y: 45 }, { x: 57, y: 44 }, { x: 60, y: 45 }, { x: 57, y: 46 },
    // Mouth
    { x: 45, y: 68 }, { x: 48, y: 70 }, { x: 50, y: 71 }, { x: 52, y: 70 }, { x: 55, y: 68 }, { x: 52, y: 69 }, { x: 48, y: 69 }
  ];

  async ngOnInit() {
    this.meshPoints.set(this.MESH_DATA);
    await this.startCamera();
    this.runSystemLogSimulation();
  }
  
  ngOnDestroy() {
    this.stopCamera();
    if (this.logInterval) {
      clearInterval(this.logInterval);
    }
  }

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (this.videoElement) {
        this.videoElement.nativeElement.srcObject = this.stream;
      }
    } catch (e) {
      this.addLog(`[ERROR] Camera access denied. Grant permission and refresh.`);
      console.warn('Camera access denied or unavailable', e);
    }
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  private addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    this.logs.update(currentLogs => [...currentLogs, `[${timestamp}] ${message}`]);
  }

  private runSystemLogSimulation() {
    const logQueue: (string | (() => void | boolean))[] = [
      'Neural Link Established',
      'Camera Active. Scanning...',
      'Initializing Sensor Array...',
      'WARN: High deviation detected in landmark tracking.',
      'Recalibrating depth sensors...',
      () => {
        this.addLog('Sensor recalibration complete. Lock acquired.');
        this.faceDetected.set(true); // This "fixes" the alignment issue.
      },
      'Doppel Engine Ready. Awaiting model selection.',
      () => {
        if (this.selectedPreset()) {
           this.addLog(`Model preset '${this.selectedPreset()}' loaded into buffer.`);
           return true; // stop this message from repeating
        }
        return false;
      },
      'System idle. Monitoring...'
    ];

    let logIndex = 0;
    this.logInterval = setInterval(() => {
      if (logIndex < logQueue.length) {
        const nextLog = logQueue[logIndex];
        // FIX: The original check `if(processed)` caused a TypeScript error because a `void`
        // return type cannot be checked for truthiness.
        // The logic is also updated to correctly poll functions that return `false`,
        // rather than incorrectly advancing past them.
        if (typeof nextLog === 'function') {
          const processed = nextLog();
          if (processed === true) {
            // Function has completed its condition, remove it.
            logQueue.splice(logIndex, 1);
          } else if (typeof processed === 'undefined') {
            // This was a fire-and-forget function that returns void. Execute once and move on.
            logIndex++;
          }
          // If `processed` is `false`, we do nothing to `logIndex` to re-evaluate next time.
        } else {
          // It's a string, just log it and move on.
          this.addLog(nextLog);
          logIndex++;
        }
      } else {
        // After initial sequence, add idle messages
         if (Math.random() > 0.95) {
           this.addLog('Heartbeat OK. System nominal.');
         }
      }
    }, 1500);
  }
}
