import { Component, OnInit, OnDestroy } from '@angular/core';
import { Howl } from 'howler';
import { FormsModule } from '@angular/forms';  
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-metronome',
  imports: [FormsModule],
  standalone: true,  // Especifica que es un componente standalone
  templateUrl: './metronome.component.html',
  styleUrls: ['./metronome.component.css']
})



export class MetronomeComponent implements OnInit, OnDestroy {
  bpm: number = 120; // initial value of the bpm
  metronomeRunning: boolean = false;
  interval: any; // Variable that saves the setInterval
  tickSound: Howl;
  tickSoundFirst: Howl;
  nameTickSound: String = "Snap";
  nameTickSoundFirst: String = "Bleep";
  denominator: number = 4;
  //tap-tempo
  private tapTimes: number[] = [];
  public bpmTap: number | null = null;
  private maxTaps: number = 5;

  constructor() {
    this.tickSound = new Howl({
      src: ['assets/'+this.nameTickSound+'.mp3'],
      html5: true
    });
    this.tickSoundFirst = new Howl({
      src: ['assets/'+this.nameTickSoundFirst+'.mp3'],
      
      html5: true 
    });
  }

  //tap-tempo
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

  //tap-tempo
  reset() {
    this.tapTimes = [];
    this.bpmTap = null;
  }


  ngOnInit() {
  }

  ngOnDestroy() {
    this.stopMetronome();
  }

  //metode for the play/stop button
  toggleMetronome() {
    if (this.metronomeRunning) {
      this.stopMetronome();
    } else {
      this.startMetronome();
    }
  }

  //metode that assign beat
  assignBeat (value: number){
    this.denominator = value;
  }

  //metode that assign sound1
  assignSound1 (value: string){
    this.nameTickSoundFirst = value;
  }
  //metode that assign sound2
  assignSound2 (value: string){
    this.nameTickSound = value;
  }

  //metode that starts the metronome
  startMetronome() {
    let counter = 1;
    const intervalMs = (60 / this.bpm) * 1000;
    this.interval = setInterval(() => {

      if (counter >this.denominator){
        counter = 1;
      }
      // execute a sound every interval
      switch(counter){
        case 1:
          this.tickSoundFirst.play();
          counter ++;
          break;

        default:
          this.tickSound.play();
          counter ++;
          break;
      }
    }, intervalMs);

    this.metronomeRunning = true;
  }

  //metode that stops the metronome
  stopMetronome() {
    clearInterval(this.interval);
    this.metronomeRunning = false;
  }
}

