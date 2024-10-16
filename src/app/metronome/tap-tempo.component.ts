import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tap-tempo',
  templateUrl: './tap-tempo.component.html',
  standalone: true,  // Especifica que es un componente standalone
  styleUrls: ['./tap-tempo.component.css']
})

export class TapTempoComponent {
    private tapTimes: number[] = [];
    public bpm: number | null = null;
    private maxTaps: number = 5; // Número máximo de taps a considerar
  
    constructor() {}
  
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
        this.bpm = null;
      }
    }
  
    reset() {
      this.tapTimes = [];
      this.bpm = null;
    }
  }