import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-metronome',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './metronome.component.html',
  styleUrls: ['./metronome.component.css']
})
export class MetronomeComponent implements OnInit, OnDestroy {
  bpm: number = 150;
  metronomeRunning: boolean = false;
  private intervalId: any;
  private audioCtx?: AudioContext;
  private clickBuffer: AudioBuffer | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Verifica si estamos en navegador y si AudioContext está disponible
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('AudioContext está disponible.');
    } else {
      
    }
  }

  ngOnInit(): void {
    this.loadClickSound();
  }

  ngOnDestroy(): void {
    this.stopMetronome();
  }

  async loadClickSound() {
    if (!this.audioCtx) return;

    try {
      const response = await fetch('/assets/Bleep.mp3'); // ruta desde "src/assets"
      const arrayBuffer = await response.arrayBuffer();
      this.clickBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error('Error al cargar el sonido:', error);
    }
  }

  playClick() {
    if (!this.audioCtx || !this.clickBuffer) return;

    const source = this.audioCtx.createBufferSource();
    source.buffer = this.clickBuffer;
    source.connect(this.audioCtx.destination);
    source.start();
  }

  toggleMetronome() {
    if (this.metronomeRunning) {
      this.stopMetronome();
    } else {
      this.startMetronome();
    }
  }

  startMetronome() {
    if (!this.audioCtx) return;

    this.audioCtx.resume(); // Reanudar el contexto si está suspendido
    const intervalMs = (60 / this.bpm) * 1000;

    this.intervalId = setInterval(() => {
      this.playClick();
    }, intervalMs);

    this.metronomeRunning = true;
  }

  stopMetronome() {
    clearInterval(this.intervalId);
    this.metronomeRunning = false;
  }
}
