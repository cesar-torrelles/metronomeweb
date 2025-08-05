// decapitator-controller.ts

type StyleType = 'A' | 'B' | 'C'; // Si hay más estilos, agrégalos aquí

type NumericParam = {
  [K in keyof DecapitatorParams]: DecapitatorParams[K] extends number ? K : never;
}[keyof DecapitatorParams];


interface DecapitatorParams {
  drive: number;
  lowCut: number;
  tone: number;
  highCut: number;
  mix: number;
  punish: boolean;
  style: StyleType;
}

export class DecapitatorController {
  parameters: DecapitatorParams = {
    drive: 5,
    lowCut: 2,
    tone: 5,
    highCut: 8,
    mix: 10,
    punish: false,
    style: 'A'
  };

  vuLevel: number = 0;

  constructor() {
    //this.init();
    //this.startVUAnimation();
  }

  init(): void {
    this.initKnobs();
    this.initPunishButton();
    this.initStyleButtons();
    this.initVUMeter();
  }

  initKnobs(): void {
    const knobs = document.querySelectorAll<SVGSVGElement>('.knob-svg');
    knobs.forEach(knob => {
      this.createKnobElements(knob);
      this.addKnobInteraction(knob);
    });
  }

  createKnobElements(svg: SVGSVGElement): void {
        const param = svg.dataset['param'] as NumericParam;
        const size = parseInt(svg.getAttribute('width') ?? '0');
        const center = size / 2;
        const knobRadius = (size - 30) / 2;
        
        // Clear existing content except defs
        const defs = svg.querySelector('defs');
        svg.innerHTML = '';
        if (defs) svg.appendChild(defs);
        
        // Create tick marks
        const ticksGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        ticksGroup.setAttribute('transform', `translate(15, 15)`);
    }

  addKnobInteraction(svg: SVGSVGElement): void {
    const param = svg.dataset['param'] as NumericParam;
    let isDragging = false;
    let startY = 0;
    let startValue = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startY = e.clientY;
      startValue = this.parameters[param] as number;
      e.preventDefault();

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging) return;

  const deltaY = startY - e.clientY;
  const min = parseFloat(svg.dataset['min']!);
  const max = parseFloat(svg.dataset['max']!);
  const range = max - min;
  const sensitivity = range / 200;
  const newValue = Math.max(min, Math.min(max, startValue + deltaY * sensitivity));

  const param = svg.dataset['param'] as NumericParam;

  this.parameters[param] = Math.round(newValue * 10) / 10;
  this.updateKnobPointer(svg);
  this.updateValueDisplay(param);
};


    const handleMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    svg.addEventListener('mousedown', handleMouseDown);
  }

  updateKnobPointer(svg: SVGSVGElement): void {
    const param = svg.dataset['param'] as NumericParam;
    const min = parseFloat(svg.dataset['min']!);
    const max = parseFloat(svg.dataset['max']!);
    const value = this.parameters[param];
    const normalize = (val: number) => (val - min) / (max - min);
    const rotation = normalize(value) * 270 - 135;

    const pointerGroup = svg.querySelector<SVGGElement>('.pointer-group');
    if (pointerGroup) {
      const center = parseInt(svg.getAttribute('width')!)/2;
      pointerGroup.setAttribute('transform', `translate(${center}, ${center}) rotate(${rotation})`);
    }
  }

  updateValueDisplay(param: NumericParam): void {
    
    const valueElement = document.getElementById(`${param}Value`);
    if (valueElement) {
        
      valueElement.textContent = this.parameters[param].toFixed(1);
    }
  }

  initPunishButton(): void {
    const punishButton = document.getElementById('punishButton');
    punishButton?.addEventListener('click', () => {
      this.parameters.punish = !this.parameters.punish;
      punishButton.classList.toggle('active', this.parameters.punish);
    });
  }

  initStyleButtons(): void {
    const styleButtons = document.querySelectorAll<HTMLButtonElement>('.style-button');
    styleButtons.forEach(button => {
      button.addEventListener('click', () => {
        const style = button.dataset['style'] as StyleType;
        this.parameters.style = style;
        styleButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
      });
    });
  }

  initVUMeter(): void {
    const svg = document.querySelector<SVGSVGElement>('.vu-meter');
    const scaleGroup = svg?.querySelector<SVGGElement>('.scale-markings');
    if (!scaleGroup) return;

    const dbValues = [-20, -10, -7, -5, -3, -1, 0, 1, 3, 5, 7, 10];
    dbValues.forEach((db, i) => {
      const angle = -45 + (i / 11) * 90;
      const isZero = db === 0;
      const isRed = db > 0;
      const radius = 55;
      const x1 = 100 + Math.cos(angle * Math.PI / 180) * radius;
      const y1 = 100 + Math.sin(angle * Math.PI / 180) * radius;
      const x2 = 100 + Math.cos(angle * Math.PI / 180) * (radius + 8);
      const y2 = 100 + Math.sin(angle * Math.PI / 180) * (radius + 8);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1.toString());
      line.setAttribute('y1', y1.toString());
      line.setAttribute('x2', x2.toString());
      line.setAttribute('y2', y2.toString());
      line.setAttribute('stroke', isRed ? '#DC2626' : '#2A2A2A');
      line.setAttribute('stroke-width', isZero ? '3' : '2');
      scaleGroup.appendChild(line);

      const numX = 100 + Math.cos(angle * Math.PI / 180) * (radius + 18);
      const numY = 100 + Math.sin(angle * Math.PI / 180) * (radius + 18);
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', numX.toString());
      text.setAttribute('y', numY.toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.setAttribute('font-size', '8');
      text.setAttribute('fill', isRed ? '#DC2626' : '#2A2A2A');
      text.setAttribute('font-family', 'Arial, sans-serif');
      text.setAttribute('font-weight', isZero ? 'bold' : 'normal');
      text.textContent = db.toString();
      scaleGroup.appendChild(text);
    });
  }

  updateVUMeter(): void {
    const needle = document.getElementById('vuNeedle');
    if (needle) {
      const needleAngle = (this.vuLevel / 100) * 90 - 45;
      needle.setAttribute('transform', `translate(100, 100) rotate(${needleAngle})`);
    }
  }

  startVUAnimation(): void {
    setInterval(() => {
      const baseLevel = (this.parameters.drive / 10) * (this.parameters.mix / 10) * 60;
      const variation = Math.random() * 20 - 10;
      this.vuLevel = Math.max(0, Math.min(100, baseLevel + variation));
      this.updateVUMeter();
    }, 100);
  }

  getParameters(): DecapitatorParams {
    return { ...this.parameters };
  }

  setParameter<K extends keyof DecapitatorParams>(param: K, value: DecapitatorParams[K]): void {
  if (param in this.parameters) {
      this.parameters[param] = value;

      if (param === 'punish') {
        const punishButton = document.getElementById('punishButton');
        punishButton?.classList.toggle('active', value as boolean);
      } else if (param === 'style') {
        const styleButtons = document.querySelectorAll<HTMLButtonElement>('.style-button');
        styleButtons.forEach(btn => btn.classList.toggle('active', btn.dataset['style'] === value));
      } else {
        const knob = document.querySelector<SVGSVGElement>(`[data-param="${param}"]`);
        if (knob) {
          this.updateKnobPointer(knob);
          this.updateValueDisplay(param);
        }
      }
    }
  }
}


