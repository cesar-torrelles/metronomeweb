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
  bpm: number = 120;
  metronomeRunning: boolean = false;
  private intervalId: any;
  private audioCtx?: AudioContext;
  private clickBuffer1: AudioBuffer | null = null;
  private clickBuffer2: AudioBuffer | null = null;
  private tapTimes: number[] = [];
  private maxTaps: number = 5;
  public bpmTap: number | null = null;
  denominator: number = 4;
  
  
  soundsArray = [
    '/assets/Bleep.mp3',
    '/assets/Bongo1.mp3',
    '/assets/Bongo2.mp3',
    '/assets/Bongo3.mp3',
    '/assets/Bongo4.mp3',
    '/assets/hihat.mp3',
    '/assets/Kick.mp3',
    '/assets/Perc_Hi.mp3',
    '/assets/Snap.mp3',
    '/assets/Snare.mp3'];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Verifica si estamos en navegador y si AudioContext está disponible
    if (isPlatformBrowser(this.platformId) && typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('AudioContext está disponible.');
    } else {
      
    }
  }

  ngOnInit(): void {
    this.loadClickSound1("1");
  }

  ngOnDestroy(): void {
    this.stopMetronome();
  }

  
  async loadClickSound1(value: string) {
    console.log(value);
    const parsedValue = parseInt(value, 10);
    if (!this.audioCtx) return;

    try {
      const sound = await fetch(this.soundsArray[parsedValue]); // ruta desde "src/assets"
      const arrayBuffer = await sound.arrayBuffer();
      this.clickBuffer1 = await this.audioCtx.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error('Error al cargar el sonido:', error);
    }
  }

  async loadClickSound2(value: string) {
    console.log(value);
    const parsedValue = parseInt(value, 10);
    if (!this.audioCtx) return;

    try {
      const sound = await fetch(this.soundsArray[parsedValue]); // ruta desde "src/assets"
      const arrayBuffer = await sound.arrayBuffer();
      this.clickBuffer2 = await this.audioCtx.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error('Error al cargar el sonido:', error);
    }
  }

  playClick1() {
    if (!this.audioCtx || !this.clickBuffer1) return;

    const source = this.audioCtx.createBufferSource();
    source.buffer = this.clickBuffer1;
    source.connect(this.audioCtx.destination);
    source.start(this.audioCtx.currentTime);
  }

  playClick2() {
    if (!this.audioCtx || !this.clickBuffer2) return;

    const source = this.audioCtx.createBufferSource();
    source.buffer = this.clickBuffer2;
    source.connect(this.audioCtx.destination);
    source.start(this.audioCtx.currentTime + 0.1); // Añadir un pequeño retraso para evitar solapamiento
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
      this.playClick1();
      this.playClick2();
    }, intervalMs);

    this.metronomeRunning = true;
  }

  stopMetronome() {
    clearInterval(this.intervalId);
    this.metronomeRunning = false;
  }


  onKeyPress(event: KeyboardEvent): void {
    const inputChar = event.key;
    const currentValue = (event.target as HTMLInputElement).value;

    // Permitir solo números y un máximo de 3 cifras
    if (!/^\d$/.test(inputChar) || currentValue.length >= 3) {
      event.preventDefault(); // Bloquea la entrada
    }
  }

  onTap() {

    const currentTime = Date.now();
    this.tapTimes.push(currentTime);

    // Mantener solo los últimos `maxTaps` tiempos
    if (this.tapTimes.length > this.maxTaps) {
      this.tapTimes.shift();
    }

    if (this.tapTimes.length >= 2) {
      // Calcular los intervalos entre taps
      const intervals = [];
      for (let i = 1; i < this.tapTimes.length; i++) {
        intervals.push(this.tapTimes[i] - this.tapTimes[i - 1]);
      }

      // Calcular el intervalo promedio
      const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;

      // Calcular BPM
      this.bpm = Math.round(60000 / averageInterval);
    } else {
      this.bpmTap = null;
    }
  }
   //metode that assign beat
  assignBeat(value: string) {
    const parsedValue = parseInt(value, 10);
    this.denominator = parsedValue;

  }

  
}
