const pointBases = {
  startPointX: 100, startPointY: 250,
  controlPointX: 245, controlPointY: 100,
  endPointX: 390, endPointY: 250,
};

export default class PathHandler {

  svg = document.querySelector('svg');
  path = document.querySelector('path');
  text = document.querySelector('text');
  pointInputs = document.querySelectorAll('[data-point-input]');

  // path movement
  initialMousePosition = { x: 0, y: 0 };
  movingPath = false;
  
  // points movement with dragging
  allFocusButtons = Array.from(document.querySelectorAll('[data-focus-button]'));
  focusedCircle = null;
  circles = {
    start: document.querySelector('[data-path-circle="start"]'),
    control: document.querySelector('[data-path-circle="control"]'),
    end: document.querySelector('[data-path-circle="end"]')
  }

  // stores bezier points positions
  points = {};

  constructor(theEventTarget) {
    this.eventTarget = theEventTarget;

    this.eventTarget.addEventListener('movePath', (event) => {
      this.movePath(event.actionParameters.textOffsetX, event.actionParameters.textOffsetY);
    });
    this.eventTarget.addEventListener('path', () => this.updatePath());
    this.eventTarget.addEventListener('pointInputs', () => this.updatePointInputs());

    this.#addButtonListeners();
    this.#addCircleListeners();
    this.#addInputListeners();
    this.#addPathMovementListeners();

    this.resetPath();
  }

  #addButtonListeners() {
    // resetting
    document.querySelector('[data-button="reset-path"]')
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
    const circles = Array.from(document.querySelectorAll('[data-path-circle]'));

    for(let circle of circles) {
      circle.addEventListener('mousedown', (event) => {
        this.focusedCircle = event.currentTarget;
      });
    }

    window.addEventListener('mouseup', () => {
      this.focusedCircle = null;
      for(let val of this.allFocusButtons)
        val.classList.remove('focus-button--active');
    });

    window.addEventListener('mousemove', (event) => {
      if(!this.focusedCircle)
        return;

      const svgRect = this.svg.getBoundingClientRect();

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
    // number inputs
    const onPathInputUpdate = (event) => {
      const parameter = event.currentTarget.getAttribute('data-point-input');

      this.points[parameter] = Number(event.currentTarget.value);

      this.updatePath('input');
    }

    const pointNames = ['startPointX', 'startPointY', 
      'controlPointX', 'controlPointY', 'endPointX', 'endPointY'];

    for(let name of pointNames) {
      const input = document.querySelector(`[data-point-input="${name}"]`);

      input.value = this.points[name];
      input.addEventListener('input', (event) => onPathInputUpdate(event));
    }
  }

  #addPathMovementListeners() {
    // drag and move
    const group = document.querySelector('[data-path-move-group]');
    
    group.addEventListener('mousedown', (event) => {
      this.initialMousePosition.x = event.clientX;
      this.initialMousePosition.y = event.clientY;

      this.movingPath = true;
      group.classList.add('svg__path-and-text-group--grabbing');
    });

    window.addEventListener('mouseup', () => {
      this.movingPath = false;
      group.classList.remove('svg__path-and-text-group--grabbing');
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
    let d = `M ${this.points.startPointX},${this.points.startPointY} `;
    d += `Q ${this.points.controlPointX},${this.points.controlPointY} `;
    d += `${this.points.endPointX},${this.points.endPointY} `;

    this.path.setAttributeNS(null, 'd', d);

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