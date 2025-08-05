class DecapitatorController {
    constructor() {
        this.parameters = {
            drive: 5,
            lowCut: 2,
            tone: 5,
            highCut: 8,
            mix: 10,
            punish: false,
            style: 'A'
        };
        
        this.vuLevel = 0;
        this.init();
        this.startVUAnimation();
    }

    init() {
        this.initKnobs();
        this.initPunishButton();
        this.initStyleButtons();
        this.initVUMeter();
    }

    initKnobs() {
        const knobs = document.querySelectorAll('.knob-svg');
        
        knobs.forEach(knob => {
            this.createKnobElements(knob);
            this.addKnobInteraction(knob);
        });
    }

    createKnobElements(svg) {
        const param = svg.dataset.param;
        const size = parseInt(svg.getAttribute('width'));
        const center = size / 2;
        const knobRadius = (size - 30) / 2;
        
        // Clear existing content except defs
        const defs = svg.querySelector('defs');
        svg.innerHTML = '';
        if (defs) svg.appendChild(defs);
        
        // Create tick marks
        const ticksGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        ticksGroup.setAttribute('transform', `translate(15, 15)`);
        
        const numTicks = 11;
        for (let i = 0; i < numTicks; i++) {
            const angle = -135 + (i / (numTicks - 1)) * 270;
            const tickLength = i % 5 === 0 ? 8 : 5;
            const radius = knobRadius - 15;
            
            const x1 = (size - 30) / 2 + Math.cos(angle * Math.PI / 180) * radius;
            const y1 = (size - 30) / 2 + Math.sin(angle * Math.PI / 180) * radius;
            const x2 = (size - 30) / 2 + Math.cos(angle * Math.PI / 180) * (radius + tickLength);
            const y2 = (size - 30) / 2 + Math.sin(angle * Math.PI / 180) * (radius + tickLength);
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', '#8B7355');
            line.setAttribute('stroke-width', i % 5 === 0 ? 2 : 1);
            ticksGroup.appendChild(line);
            
            // Add numbers for major ticks
            if (i % 5 === 0) {
                const numberRadius = radius + 15;
                const numX = (size - 30) / 2 + Math.cos(angle * Math.PI / 180) * numberRadius;
                const numY = (size - 30) / 2 + Math.sin(angle * Math.PI / 180) * numberRadius;
                
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', numX);
                text.setAttribute('y', numY);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('dominant-baseline', 'central');
                text.setAttribute('font-size', '10');
                text.setAttribute('fill', '#8B7355');
                text.setAttribute('font-family', 'Arial, sans-serif');
                text.textContent = i / 2;
                ticksGroup.appendChild(text);
            }
        }
        svg.appendChild(ticksGroup);
        
        // Outer ring shadow
        const outerShadow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        outerShadow.setAttribute('cx', center);
        outerShadow.setAttribute('cy', center);
        outerShadow.setAttribute('r', knobRadius + 2);
        outerShadow.setAttribute('fill', 'url(#knobShadow)');
        svg.appendChild(outerShadow);
        
        // Knob body
        const knobBody = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        knobBody.setAttribute('cx', center);
        knobBody.setAttribute('cy', center);
        knobBody.setAttribute('r', knobRadius);
        knobBody.setAttribute('fill', `url(#knobGradient${param === 'drive' ? '' : param === 'lowCut' ? '2' : param === 'tone' ? '3' : param === 'highCut' ? '4' : '5'})`);
        knobBody.setAttribute('stroke', '#2A2A2A');
        knobBody.setAttribute('stroke-width', '1');
        svg.appendChild(knobBody);
        
        // Knob center depression
        const knobInner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        knobInner.setAttribute('cx', center);
        knobInner.setAttribute('cy', center);
        knobInner.setAttribute('r', knobRadius - 8);
        knobInner.setAttribute('fill', `url(#knobInner${param === 'drive' ? '' : param === 'lowCut' ? '2' : param === 'tone' ? '3' : param === 'highCut' ? '4' : '5'})`);
        knobInner.setAttribute('stroke', '#1A1A1A');
        knobInner.setAttribute('stroke-width', '1');
        svg.appendChild(knobInner);
        
        // Pointer group
        const pointerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        pointerGroup.classList.add('pointer-group');
        pointerGroup.setAttribute('transform', `translate(${center}, ${center})`);
        
        // Pointer
        const pointer = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        pointer.setAttribute('x1', '0');
        pointer.setAttribute('y1', -knobRadius + 12);
        pointer.setAttribute('x2', '0');
        pointer.setAttribute('y2', -knobRadius + 20);
        pointer.setAttribute('stroke', '#FFD700');
        pointer.setAttribute('stroke-width', '3');
        pointer.setAttribute('stroke-linecap', 'round');
        pointerGroup.appendChild(pointer);
        
        svg.appendChild(pointerGroup);
        
        // Center dot
        const centerDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        centerDot.setAttribute('cx', center);
        centerDot.setAttribute('cy', center);
        centerDot.setAttribute('r', '3');
        centerDot.setAttribute('fill', '#1A1A1A');
        svg.appendChild(centerDot);
        
        // Update pointer position
        this.updateKnobPointer(svg);
    }

    addKnobInteraction(svg) {
        const param = svg.dataset.param;
        let isDragging = false;
        let startY = 0;
        let startValue = 0;

        const handleMouseDown = (e) => {
            isDragging = true;
            startY = e.clientY;
            startValue = this.parameters[param];
            e.preventDefault();
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        };

        const handleMouseMove = (e) => {
            if (!isDragging) return;
            
            const deltaY = startY - e.clientY;
            const min = parseFloat(svg.dataset.min);
            const max = parseFloat(svg.dataset.max);
            const range = max - min;
            const sensitivity = range / 200;
            const newValue = Math.max(min, Math.min(max, startValue + deltaY * sensitivity));
            
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

    updateKnobPointer(svg) {
        const param = svg.dataset.param;
        const min = parseFloat(svg.dataset.min);
        const max = parseFloat(svg.dataset.max);
        const value = this.parameters[param];
        
        const normalize = (val) => (val - min) / (max - min);
        const rotation = normalize(value) * 270 - 135;
        
        const pointerGroup = svg.querySelector('.pointer-group');
        if (pointerGroup) {
            const center = parseInt(svg.getAttribute('width')) / 2;
            pointerGroup.setAttribute('transform', `translate(${center}, ${center}) rotate(${rotation})`);
        }
    }

    updateValueDisplay(param) {
        const valueElement = document.getElementById(`${param}Value`);
        if (valueElement) {
            valueElement.textContent = this.parameters[param].toFixed(1);
        }
    }

    initPunishButton() {
        const punishButton = document.getElementById('punishButton');
        
        punishButton.addEventListener('click', () => {
            this.parameters.punish = !this.parameters.punish;
            punishButton.classList.toggle('active', this.parameters.punish);
        });
    }

    initStyleButtons() {
        const styleButtons = document.querySelectorAll('.style-button');
        
        styleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const style = button.dataset.style;
                this.parameters.style = style;
                
                // Update active state
                styleButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }

    initVUMeter() {
        const svg = document.querySelector('.vu-meter');
        const scaleGroup = svg.querySelector('.scale-markings');
        
        // Generate VU meter scale
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
            
            // Scale line
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', isRed ? '#DC2626' : '#2A2A2A');
            line.setAttribute('stroke-width', isZero ? 3 : 2);
            scaleGroup.appendChild(line);
            
            // Number
            const numX = 100 + Math.cos(angle * Math.PI / 180) * (radius + 18);
            const numY = 100 + Math.sin(angle * Math.PI / 180) * (radius + 18);
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', numX);
            text.setAttribute('y', numY);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'central');
            text.setAttribute('font-size', '8');
            text.setAttribute('fill', isRed ? '#DC2626' : '#2A2A2A');
            text.setAttribute('font-family', 'Arial, sans-serif');
            text.setAttribute('font-weight', isZero ? 'bold' : 'normal');
            text.textContent = db;
            scaleGroup.appendChild(text);
        });
        
        // Add minor scale lines
        for (let i = 1; i < 23; i += 2) {
            const angle = -45 + (i / 22) * 90;
            const radius = 55;
            const x1 = 100 + Math.cos(angle * Math.PI / 180) * radius;
            const y1 = 100 + Math.sin(angle * Math.PI / 180) * radius;
            const x2 = 100 + Math.cos(angle * Math.PI / 180) * (radius + 4);
            const y2 = 100 + Math.sin(angle * Math.PI / 180) * (radius + 4);
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x1);
            line.setAttribute('y1', y1);
            line.setAttribute('x2', x2);
            line.setAttribute('y2', y2);
            line.setAttribute('stroke', '#2A2A2A');
            line.setAttribute('stroke-width', '1');
            scaleGroup.appendChild(line);
        }
    }

    updateVUMeter() {
        const needle = document.getElementById('vuNeedle');
        if (needle) {
            const needleAngle = (this.vuLevel / 100) * 90 - 45;
            needle.setAttribute('transform', `translate(100, 100) rotate(${needleAngle})`);
        }
    }

    startVUAnimation() {
        setInterval(() => {
            const baseLevel = (this.parameters.drive / 10) * (this.parameters.mix / 10) * 60;
            const variation = Math.random() * 20 - 10;
            this.vuLevel = Math.max(0, Math.min(100, baseLevel + variation));
            this.updateVUMeter();
        }, 100);
    }

    // Método público para obtener parámetros (útil para Angular)
    getParameters() {
        return { ...this.parameters };
    }

    // Método público para establecer parámetros (útil para Angular)
    setParameter(param, value) {
        if (this.parameters.hasOwnProperty(param)) {
            this.parameters[param] = value;
            
            // Update UI accordingly
            if (param === 'punish') {
                const punishButton = document.getElementById('punishButton');
                punishButton.classList.toggle('active', value);
            } else if (param === 'style') {
                const styleButtons = document.querySelectorAll('.style-button');
                styleButtons.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.style === value);
                });
            } else if (['drive', 'lowCut', 'tone', 'highCut', 'mix'].includes(param)) {
                const knob = document.querySelector(`[data-param="${param}"]`);
                if (knob) {
                    this.updateKnobPointer(knob);
                    this.updateValueDisplay(param);
                }
            }
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.decapitator = new DecapitatorController();
});

// Export for Angular integration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DecapitatorController;
}