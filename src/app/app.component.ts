import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MetronomeComponent } from './metronome/metronome.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MetronomeComponent,RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'metronome';
}


