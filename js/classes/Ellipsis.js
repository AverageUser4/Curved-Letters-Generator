import Path from './Path.js';

export default class Ellipsis extends Path {

  arcs = [];
  isConstructed = false;

  constructor(master, svg, index) {
    super(master, svg, index, 'ellipsis');

    this.arcBases = [
      {
        radiusX: 1,
        radiusY: 1,
        sweepFlag: 1
      },
      {
        radiusX: 1,
        radiusY: 1,
        sweepFlag: 1
      }
    ];

    this.resetArcs();

    this.#addButtonListeners();
    this.#addInputListeners();

    this.isConstructed = true;
  }

  #addButtonListeners() {
    for(let button of this.associatedUIElement.querySelectorAll('[data-sweep-flag-button]')) {
      button.addEventListener('click', (event) => {
        const index = Number(event.currentTarget.getAttribute('data-sweep-flag-button'));

        if(this.arcs[index].sweepFlag === 1) {
          this.arcs[index].sweepFlag = 0;
          event.currentTarget.textContent = 'F';
        } else {
          this.arcs[index].sweepFlag = 1;
          event.currentTarget.textContent = 'T';
        }
        
        this.updateDAttribute();
      });
    }
  }

  #addInputListeners() {
    for(let input of this.associatedUIElement.querySelectorAll('[data-arc-input]')) {
      input.addEventListener('input', () => {
        const info = input.getAttribute('data-arc-input');
        this.arcs[parseInt(info)][`radius${info.charAt(info.length - 1).toUpperCase()}`] = input.value;

        this.updateDAttribute();
      });
    }
  }

  updateDAttribute(invokedBy) {
    let d = `M ${this.points[0].x},${this.points[0].y} `;
    d += `A ${this.arcs[0].radiusX} ${this.arcs[0].radiusY} 0 0 ${this.arcs[0].sweepFlag} ${this.points[1].x} ${this.points[1].y}`;
    d += `A ${this.arcs[1].radiusX} ${this.arcs[1].radiusY} 0 0 ${this.arcs[1].sweepFlag} ${this.points[2].x} ${this.points[2].y}`;

    this.pathElement.setAttributeNS(null, 'd', d);

    if(invokedBy !== 'input')
      this.updatePointInputs();
    if(invokedBy !== 'circle')
      this.updateCircles();
  }

  resetPath() {
    super.resetPath();
    if(this.isConstructed)
      this.resetArcs();
  }

  resetArcs() {
    for(let i = 0; i < this.arcBases.length; i++) {
      this.arcs[i] = {};
      this.arcs[i].radiusX = this.arcBases[i].radiusX;
      this.arcs[i].radiusY = this.arcBases[i].radiusY;
      this.arcs[i].sweepFlag = this.arcBases[i].sweepFlag;
    }

    this.updateDAttribute();
  }

}