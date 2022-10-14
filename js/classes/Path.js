const pointBases = {
  startPointX: 100, startPointY: 250,
  controlPointX: 245, controlPointY: 100,
  endPointX: 390, endPointY: 250,
};

export default class Path {

  svgElement;
  pathElement;
  textElement;
  textPathElement;
  associatedUIElement;
  groupElement;

  // ui interaction
  pointInputs;

  // path movement
  initialMousePosition = { x: 0, y: 0 };
  movingPath = false;
  
  // points movement with dragging
  allFocusButtons;
  focusedCircle = null;
  circles = [];

  // stores points' positions
  points = {};
  /*
    new structure:
    points.p1.x, points.p1.y, etc.
  */

  constructor(theEventTarget, svg) {
    this.eventTarget = theEventTarget;

    this.eventTarget.addEventListener('movePath', (event) => {
      this.movePath(event.actionParameters.textOffsetX, event.actionParameters.textOffsetY);
    });
    this.eventTarget.addEventListener('path', () => this.updatePath());
    this.eventTarget.addEventListener('pointInputs', () => this.updatePointInputs());

    // TODO: acutally add proper structure, nest these, etc.
    this.svgElement = svg;
    this.groupElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    this.textPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'textPath');

    this.textPathElement.textContent = 'My Curved Text :)';
    this.textElement.style = 'font-size: 24px;';

    // testing....................
    this.eventTarget.requestUpdate('addPathUI');
    this.associatedUIElement = []; // TODO: add way to obtaine reference to newly created UI

    this.associatedUIElement.querySelectorAll('[data-point-input]');
    this.allFocusButtons = Array.from(this.associatedUIElement.querySelectorAll('[data-focus-button]'));
    this.pointInputs = this.associatedUIElement.querySelectorAll('[data-point-input]');

    this.#addButtonListeners();
    this.#addCircleListeners();
    this.#addInputListeners();
    this.#addPathMovementListeners();
    this.#addTextListeners();

    this.resetPath();
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
      event.preventDefault();

      const currentX = Number(this.textElement.getAttributeNS(null, 'x'));
      const movementAmount = event.wheelDeltaY > 0 ? 5 : -5;

      this.textElement.setAttributeNS(null, 'x', currentX + movementAmount);
    }

    this.pathElement.addEventListener('wheel', (event) => onWheel(event), { passive: false });
    // for some reason doesn't always fire when it's only on path
    this.textElement.addEventListener('wheel', (event) => onWheel(event), { passive: false });
  }

  #addButtonListeners() {
    /*
      DONE
    */

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

    this.circles = [];

    for(let i = 0; i < this.points.length; i++) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.classList.add('svg__bezier-circle');
      circle.setAttributeNS(null, 'data-path-circle', `p${i + 1}`);
      circle.setAttributeNS(null, 'cx', this.points[i].x);
      circle.setAttributeNS(null, 'cy', this.points[i].y);
      circle.setAttributeNS(null, 'r', 7);
      circle.setAttributeNS(null, 'fill', 'green');

      circles.push(circle);
    }

    for(let circle of circles) {
      circle.addEventListener('mousedown', (event) => {
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

      const which = this.focusedCircle.getAttributeNS(null, 'data-path-circle');
      this.points[`${which}PointX`] = x;
      this.points[`${which}PointY`] = y;

      this.updatePath('circle');
    });
  }

  #addInputListeners() {
    const onPathInputUpdate = (event) => {
      const parameter = event.currentTarget.getAttribute('data-point-input');

      this.points[parameter] = Number(event.currentTarget.value);

      this.updatePath('input');
    }

    // need to decide on html's structure
    for(let i = 0; i < this.points.length; i++) {
      const input = document.querySelector(`[data-point-input="p${i + 1}"]`);
      if(!input)
        break;

      input.value = this.points[`p${i}`];
      input.addEventListener('input', (event) => onPathInputUpdate(event));
    }
  }

  #addPathMovementListeners() {
    /*
      DONE
    */

    // drag and move
    this.group.addEventListener('mousedown', (event) => {
      this.initialMousePosition.x = event.clientX;
      this.initialMousePosition.y = event.clientY;

      this.movingPath = true;
      this.group.classList.add('svg__path-and-text-group--grabbing');
    });

    window.addEventListener('mouseup', () => {
      this.movingPath = false;
      this.group.classList.remove('svg__path-and-text-group--grabbing');
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
    for(let input of this.pointInputs)
        input.value = this.points[input.getAttribute('data-point-input')];
  }

  updateCircles() {
    for(let key in this.circles) {
      this.circles[key].setAttributeNS(null, 'cx', this.points[`${key}PointX`]);
      this.circles[key].setAttributeNS(null, 'cy', this.points[`${key}PointY`]);
    }
  }

  updatePath(invokedBy) {
    // should be different on every class that inherits from this one
    let d = `M ${this.points.startPointX},${this.points.startPointY} `;
    d += `Q ${this.points.controlPointX},${this.points.controlPointY} `;
    d += `${this.points.endPointX},${this.points.endPointY} `;

    this.pathElement.setAttributeNS(null, 'd', d);

    if(invokedBy !== 'input')
      this.updatePointInputs();
    if(invokedBy !== 'circle')
      this.updateCircles();
  }

  resetPath() {
    for(let key in pointBases)
      this.points[key] = pointBases[key];

    this.updatePath();
  }

  movePath(offsetX, offsetY) {
    for(let key in this.points) {
      if(key.endsWith('PointX'))
        this.points[key] += offsetX;
      else if(key.endsWith('PointY'))
        this.points[key] += offsetY
    }

    this.updatePath();
  }

}