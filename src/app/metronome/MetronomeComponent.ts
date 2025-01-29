import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Howl } from 'howler';





@Component({
  selector: 'app-metronome',
  imports: [FormsModule],
  standalone: true,
  templateUrl: './metronome.component.html',
  styleUrls: ['./metronome.component.css']
})


export class MetronomeComponent implements OnInit, OnDestroy {

  bpm: number = 120; // initial value of the bpm
  metronomeRunning: boolean = false;
  interval: any; // Variable that saves the setInterval
  tickSoundFirst = new Howl({ src: ['assets/Kick.mp3'], preload: true, volume: 1.0, html5: true });
  tickSound = new Howl({ src: ['assets/Bongo1.mp3'], preload: true, volume: 1.0, html5: true });
  numberTickSound: number = 1;
  numberTickSoundFirst: number = 0;
  denominator: number = 4;
  //tap-tempo
  private tapTimes: number[] = [];
  public bpmTap: number | null = null;
  private maxTaps: number = 5;
  soundsArray = [
    //new Howl({ src: ['assets/Bleep.mp3'], preload: true, volume: 1.0, html5: true }),
    new Howl({ src: ['assets/Bongo1.mp3'], preload: true, volume: 1.0, html5: true }),
    new Howl({ src: ['assets/Bongo2.mp3'], preload: true, volume: 1.0, html5: true }),
    new Howl({ src: ['assets/Bongo3.mp3'], preload: true, volume: 1.0, html5: true }),
    new Howl({ src: ['assets/Bongo4.mp3'], preload: true, volume: 1.0, html5: true }),
    new Howl({ src: ['assets/hihat.mp3'], preload: true, volume: 1.0, html5: true }),
    new Howl({ src: ['assets/Kick.mp3'], preload: true, volume: 1.0, html5: true }),
    new Howl({ src: ['assets/Perc_Hi.mp3'], preload: true, volume: 1.0, html5: true }),
    new Howl({ src: ['assets/Snap.mp3'], preload: true, volume: 1.0, html5: true }),
    new Howl({ src: ['assets/Snare.mp3'], preload: true, volume: 1.0, html5: true }),
  ];

  //const sounds: Map<string, Howl> = new Map();
  constructor() {
    
  }

  onKeyPress(event: KeyboardEvent): void {
    const inputChar = event.key;
    const currentValue = (event.target as HTMLInputElement).value;

    // Permitir solo números y un máximo de 3 cifras
    if (!/^\d$/.test(inputChar) || currentValue.length >= 3) {
      event.preventDefault(); // Bloquea la entrada
    }
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
  //metode that assign sound1
  assignSound1(value: number) {
    this.numberTickSoundFirst = value;
    this.tickSoundFirst = this.soundsArray[this.numberTickSoundFirst];




  }
  //metode that assign sound2
  assignSound2(value: number) {
    this.numberTickSound = value;
    this.tickSound = this.soundsArray[this.numberTickSound];

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
  assignBeat(value: number) {
    this.denominator = value;
  }



  //metode that starts the metronome
  startMetronome() {
    let counter = 1;
    const intervalMs = (60 / this.bpm) * 1000;
    this.interval = setInterval(() => {

      if (counter > this.denominator) {
        counter = 1;
      }
      // execute a sound every interval
      switch (counter) {
        case 1:
          this.tickSoundFirst.play();

          counter++;
          break;

        default:
          this.tickSound.play();

          counter++;
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
