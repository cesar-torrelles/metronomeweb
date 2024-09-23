import { Component, OnInit, OnDestroy } from '@angular/core';
import { Howl } from 'howler';
import { FormsModule } from '@angular/forms';  


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
  denominator: number = 3;

  constructor() {
    this.tickSound = new Howl({
      src: ['assets/metronomeweb 2-Snap SP.mp3'],
      html5: true
    });
    this.tickSoundFirst = new Howl({
      src: ['assets/metronomeweb 3-Bongo C78 Hi.mp3'],
      
      html5: true 
    });
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
          console.log('TickFirst '+counter); // Ejemplo de salida a consola
          counter ++;
          break;

        default:
          this.tickSound.play();
          console.log('Tick '+counter); // Ejemplo de salida a consola
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