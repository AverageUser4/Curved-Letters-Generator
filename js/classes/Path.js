const pointBases = [
  { x: 100, y: 250 }, 
  { x: 245, y: 100 }, 
  { x: 390, y: 250 }, 
];

export default class Path {

  index;

  svgElement;
  pathElement;
  textElement;
  textPathElement;
  associatedUIElement;
  groupElement;

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
  points = [];
  /*
    new structure:
    points[0].x, points[0].y, etc.
  */

  constructor(master, svg, index) {
    this.master = master;
    this.svgElement = svg;
    this.index = index;

    this.#setUpSVGElements();
    this.resetPath();

    this.master.request('addPathUI', { index: this.index, points: this.points });
    this.associatedUIElement = document.querySelector(`[data-path-ui="${index}"]`);

    this.allFocusButtons = Array.from(this.associatedUIElement.querySelectorAll('[data-focus-button]'));
    this.pointInputs = this.associatedUIElement.querySelectorAll('[data-point-input]');

    this.#addButtonListeners();
    this.#addCircleListeners();
    this.#addInputListeners();
    this.#addPathMovementListeners();
    this.#addTextListeners();

  }

  #setUpSVGElements() {
    this.groupElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.groupElement.classList.add('svg__path-and-text-group');
    this.groupElement.setAttributeNS(null, 'data-path-move-group', 1);

    const PathID = `ctg-${Math.random().toFixed(5)}`;
    this.pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.pathElement.setAttributeNS(null, 'id', PathID);
    this.pathElement.setAttributeNS(null, 'fill', 'transparent');
    this.pathElement.setAttributeNS(null, 'stroke', 'red');

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

  #addTextListeners() {
    /*
      DONE
    */
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
      /*
        needs testing
      */
      event.preventDefault();

      if(event.ctrlKey) {
        const currentSize = parseInt(this.textElement.style.fontSize);
        let amount = event.wheelDeltaY > 0 ? 2 : -2;
        if(currentSize + amount < 1)
          amount = 1;
  
        this.textElement.style.fontSize = currentSize + amount;
      } else {
        const currentX = Number(this.textElement.getAttributeNS(null, 'x'));
        const amount = event.wheelDeltaY > 0 ? 5 : -5;
  
        this.textElement.setAttributeNS(null, 'x', currentX + amount);
      }

    }

    this.pathElement.addEventListener('wheel', (event) => onWheel(event), { passive: false });
    // for some reason doesn't always fire when it's only on path
    this.textElement.addEventListener('wheel', (event) => onWheel(event), { passive: false });
  }

  #addButtonListeners() {
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

  #addCircleListeners() {
    /*
      - circles have to be created in this object
      - circles have to have names likes c1, c2, c3, etc. - start, control, end isn't universal
      - they need to be added to the svg
    */
    for(let i = 0; i < this.points.length; i++) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.classList.add('svg__bezier-circle');
      circle.setAttributeNS(null, 'data-path-circle', `${i}`);
      circle.setAttributeNS(null, 'cx', this.points[i].x);
      circle.setAttributeNS(null, 'cy', this.points[i].y);
      circle.setAttributeNS(null, 'r', 7);
      circle.setAttributeNS(null, 'fill', 'green');

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

  #addInputListeners() {
    /*
      DONE
    */
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

  #addPathMovementListeners() {
    /*
      DONE
    */

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
    /*
      DONE
    */
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
    /*
      DONE
    */
    for(let i = 0; i < this.circles.length; i++) {
      this.circles[i].setAttributeNS(null, 'cx', this.points[i].x);
      this.circles[i].setAttributeNS(null, 'cy', this.points[i].y);
    }
  }

  updatePath(invokedBy) {
    // should be different on every class that inherits from this one
    let d = `M ${this.points[0].x},${this.points[0].y} `;
    d += `Q ${this.points[1].x},${this.points[1].y} `;
    d += `${this.points[2].x},${this.points[2].y} `;

    this.pathElement.setAttributeNS(null, 'd', d);

    if(invokedBy !== 'input')
      this.updatePointInputs();
    if(invokedBy !== 'circle')
      this.updateCircles();
  }

  resetPath() {
    /*
      DONE
    */
    for(let i = 0; i < pointBases.length; i++)
      this.points[i] = pointBases[i];

    this.updatePath();
  }

  movePath(offsetX, offsetY) {
    /*
      DONE
    */

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