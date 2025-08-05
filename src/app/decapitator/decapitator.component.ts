import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DecapitatorController } from './decapitatorController';

@Component({
  selector: 'app-decapitator',
  standalone: true,
  templateUrl: './decapitator.component.html',
  styleUrls: ['./decapitator.component.css']
})
export class DecapitatorComponent implements AfterViewInit {

  private controller: DecapitatorController | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.controller = new DecapitatorController();
      this.controller.init();
    }
  }

  getParameters(): any {
    return this.controller?.getParameters();
  }

  setParameter(param: any, value: any): void {
    this.controller?.setParameter(param, value);
  }
}
