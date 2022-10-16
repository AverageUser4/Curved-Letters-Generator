import colorMaster from './ColorMaster.js';

export default class Path {

  svgElement;
  pathElement;
  textElement;
  textPathElement;
  associatedUIElement;
  groupElement;

  // identification
  index;

  // for random colors of circles and paths
  svgBackgroundColor;

  // ui interaction
  pointInputs = [];

  // path movement
  initialMousePosition = { x: 0, y: 0 };
  movingPath = false;
  
  // points movement with dragging
  allFocusButtons;
  focusedCircle = null;
  circles = [];

  // stores points' positions
  pointBases;
  points = [];

  constructor(master, svg, index, kind) {
    this.master = master;
    this.svgElement = svg;
    this.index = index;

    this.pointBases = [
      { x: 100, y: 250 }, 
      { x: 245, y: 100 }, 
      { x: 390, y: 250 }, 
    ];

    if(kind === 'cubic')
      this.pointBases = [
        { x: 100, y: 250 }, 
        { x: 150, y: 100 }, 
        { x: 340, y: 100 },
        { x: 390, y: 250 },
      ];

    const svgBackgroundColor = colorMaster.stringToObject(getComputedStyle(this.svgElement).backgroundColor);
    this.color = colorMaster.getContrastingColor(svgBackgroundColor, true);

    this.setUpSVGElements();
    this.resetPath();

    this.master.request('addPathUI', { index: this.index, points: this.points });
    this.associatedUIElement = document.querySelector(`[data-path-ui="${index}"]`);

    this.allFocusButtons = Array.from(this.associatedUIElement.querySelectorAll('[data-focus-button]'));
    this.pointInputs = this.associatedUIElement.querySelectorAll('[data-point-input]');

    this.addButtonListeners();
    this.addCircleListeners();
    this.addInputListeners();
    this.addPathMovementListeners();
    this.addTextListeners();
  }

  setUpSVGElements() {
    this.groupElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.groupElement.classList.add('svg__path-and-text-group');
    this.groupElement.setAttributeNS(null, 'data-path-group', this.index);

    const PathID = `ctg-${Math.random().toFixed(5)}`;
    this.pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.pathElement.setAttributeNS(null, 'id', PathID);
    this.pathElement.setAttributeNS(null, 'fill', 'transparent');
    this.pathElement.setAttributeNS(null, 'stroke', this.color, true);

    this.textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    this.textElement.setAttributeNS(null, 'font-size', '24px');

    this.textPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'textPath');
    this.textPathElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#${PathID}`);

    this.svgElement.append(this.groupElement);
    this.groupElement.append(this.pathElement, this.textElement);
    this.textElement.append(this.textPathElement);

    this.textPathElement.textContent = 'My Curved Text :)';
    this.textElement.style = 'font-size: 24px;';
  }

  addTextListeners() {
    this.associatedUIElement.querySelector('[data-text-input="size"]')
      .addEventListener('input', (event) => {
        this.textElement.style.fontSize = event.currentTarget.value + 'px';
      });

    this.associatedUIElement.querySelector('[data-text-input="textContent"]')
      .addEventListener('input', (event) => {
        this.textElement.children[0].textContent = event.currentTarget.value;
      });

    this.associatedUIElement.querySelector('[data-text-input="style"]')
      .addEventListener('input', 
        (event) =>  this.textElement.style = event.currentTarget.value);

    const inputX = this.associatedUIElement.querySelector('[data-text-input="x"]');
    inputX.addEventListener('input', (event) => {
      this.textElement.setAttributeNS(null, 'x', event.currentTarget.value);
    });

    // change x when scrolling over the path
    const onWheel = (event) => {
      event.preventDefault();

      if(event.ctrlKey) {
        const currentSize = parseInt(this.textElement.style.fontSize);
        let amount = event.wheelDeltaY > 0 ? 2 : -2;
        if(currentSize + amount < 1)
          amount = 1;
  
        this.textElement.style.fontSize = currentSize + amount + 'px';
      } else {
        const currentX = Number(this.textElement.getAttributeNS(null, 'x'));
        const amount = event.wheelDeltaY > 0 ? 5 : -5;
  
        this.textElement.setAttributeNS(null, 'x', currentX + amount);
      }

    }

    this.pathElement.addEventListener('wheel', (event) => onWheel(event), { passive: false });
    // for some reason doesn't always fire when it's only on path
    this.textElement.addEventListener('wheel', (event) => onWheel(event), { passive: false });

    // focus text input when text is double clicked
    // may add other invisible input that wont cause scrolling when typing (position fixed probably)
    this.textElement.addEventListener('dblclick', () => {
      this.associatedUIElement.querySelector('[data-text-input="textContent"]')
        .focus({ preventScroll: true });
    });
  }

  addButtonListeners() {
    // resetting
    this.associatedUIElement.querySelector('[data-button="reset-path"]')
      .addEventListener('click', () => this.resetPath());

    // focusing
    const focusButtonOnClick = (event) => {
      const which = event.currentTarget.getAttribute('data-focus-button');

      for(let val of this.allFocusButtons)
        val.classList.remove('focus-button--active');

      if(this.focusedCircle === this.circles[which]) {
        this.focusedCircle = null;
        return;
      }

      event.currentTarget.classList.add('focus-button--active');
      this.focusedCircle = this.circles[which];

      event.stopPropagation();
    }

    for(let val of this.allFocusButtons)
      val.addEventListener('click', (event) => focusButtonOnClick(event));
  }

  addCircleListeners() {
    for(let i = 0; i < this.points.length; i++) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.classList.add('svg__bezier-circle');
      circle.setAttributeNS(null, 'data-path-circle', `${i}`);
      circle.setAttributeNS(null, 'cx', this.points[i].x);
      circle.setAttributeNS(null, 'cy', this.points[i].y);
      circle.setAttributeNS(null, 'r', 7);
      circle.setAttributeNS(null, 'fill', this.color);
      circle.setAttributeNS(null, 'fill-opacity', 0.7);

      this.circles.push(circle);
    }

    this.groupElement.append(...this.circles);

    for(let circle of this.circles) {
      circle.addEventListener('mousedown', (event) => {
        event.stopPropagation();

        this.focusedCircle = event.currentTarget;
      });
    }

    window.addEventListener('mouseup', () => {
      this.focusedCircle = null;
      for(let button of this.allFocusButtons)
        button.classList.remove('focus-button--active');
    });

    window.addEventListener('mousemove', (event) => {
      if(!this.focusedCircle)
        return;

      const svgRect = this.svgElement.getBoundingClientRect();

      const x = Math.round(event.clientX - svgRect.x);
      const y = Math.round(event.clientY - svgRect.y);

      this.focusedCircle.setAttributeNS(null, 'cx', x);
      this.focusedCircle.setAttributeNS(null, 'cy', y);

      const which = parseInt(this.focusedCircle.getAttributeNS(null, 'data-path-circle'));
      this.points[which].x = x;
      this.points[which].y = y;

      this.updatePath('circle');
    });
  }

  addInputListeners() {
    const onPathInputUpdate = (event) => {
      const parameter = event.currentTarget.getAttribute('data-point-input');
      
      const indexAndAxis = parameter.split('-');

      this.points[indexAndAxis[0]][indexAndAxis[1]] = Number(event.currentTarget.value);

      this.updatePath('input');
    }

    for(let i = 0; i < this.points.length; i++) {
      const inputX = this.associatedUIElement.querySelector(`[data-point-input="${i}-x"]`);
      const inputY = this.associatedUIElement.querySelector(`[data-point-input="${i}-y"]`);

      inputX.value = this.points[i].x;
      inputY.value = this.points[i].y;

      inputX.addEventListener('input', (event) => onPathInputUpdate(event));
      inputY.addEventListener('input', (event) => onPathInputUpdate(event));
    }
  }

  addPathMovementListeners() {
    // drag and move
    this.groupElement.addEventListener('mousedown', (event) => {
      this.initialMousePosition.x = event.clientX;
      this.initialMousePosition.y = event.clientY;

      this.movingPath = true;
      this.groupElement.classList.add('svg__path-and-text-group--grabbing');
    });

    window.addEventListener('mouseup', () => {
      this.movingPath = false;
      this.groupElement.classList.remove('svg__path-and-text-group--grabbing');
    });

    window.addEventListener('mousemove', (event) => {
      if(!this.movingPath)
        return;

      const offsetX = Math.round(event.clientX - this.initialMousePosition.x);
      const offsetY = Math.round(event.clientY - this.initialMousePosition.y);
      this.initialMousePosition.x = event.clientX;
      this.initialMousePosition.y = event.clientY;
      this.movePath(offsetX, offsetY);
    });
  }

  updatePointInputs() {
    for(let input of this.pointInputs) {
      const which = input.getAttribute('data-point-input');

      if(which.endsWith('x')) {
        input.value = this.points[parseInt(which)].x;
      } else {
        input.value = this.points[parseInt(which)].y;
      }
    }
  }

  updateCircles() {
    for(let i = 0; i < this.circles.length; i++) {
      this.circles[i].setAttributeNS(null, 'cx', this.points[i].x);
      this.circles[i].setAttributeNS(null, 'cy', this.points[i].y);
    }
  }

  updatePath(invokedBy) {
    console.error(`'updatePath' method invoked on base Path object. (should be implemented on inheriting classes)`);
  }

  resetPath() {
    for(let i = 0; i < this.pointBases.length; i++) {
      this.points[i] = this.pointBases[i];
      // this.points[i] = {};
      // this.points[i].x = this.pointBases[i].x;
      // this.points[i].y = this.pointBases[i].y;
    }

    this.updatePath();
  }

  movePath(offsetX, offsetY) {
    for(let i = 0; i < this.points.length; i++) {
      this.points[i].x += offsetX;
      this.points[i].y += offsetY;
    }

    this.updatePath();
  }

  removeFromSVG() {
    this.groupElement.remove();
  }

}