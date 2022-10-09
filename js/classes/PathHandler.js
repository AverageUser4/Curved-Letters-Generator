const pointBases = {
  startPointX: 10, startPointY: 250,
  controlPointX: 250, controlPointY: 100,
  endPointX: 490, endPointY: 250,
};

export default class PathHandler {

  initialMousePosition = { x: 0, y: 0 };
  movingPath = false;

  svg = document.querySelector('svg');
  path = document.querySelector('path');
  text = document.querySelector('text');

  focusedCircle = null;
  circles = {
    start: document.querySelector('[data-path-circle="start"]'),
    control: document.querySelector('[data-path-circle="control"]'),
    end: document.querySelector('[data-path-circle="end"]')
  }

  allFocusButtons = Array.from(document.querySelectorAll('[data-button-focus]'));

  pointInputs = document.querySelectorAll('[data-point-inputs-container]');
  points = {};

  constructor(theEventTarget) {
    this.eventTarget = theEventTarget;

    this.eventTarget.addEventListener('movePath', (event) => {
      this.movePath(event.actionParameters.textOffsetX, event.actionParameters.textOffsetY);
    });
    this.eventTarget.addEventListener('path', () => this.updatePath());
    this.eventTarget.addEventListener('pointInputs', () => this.updatePointInputs());

    this.resetPath();

    this.#addPathListeners();
    this.#addButtonListeners();
    this.#addCircleListeners();
    this.#addPathMovementListeners();
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

      const x = event.pageX - svgRect.x;
      const y = event.pageY - svgRect.y;

      this.focusedCircle.setAttributeNS(null, 'cx', x);
      this.focusedCircle.setAttributeNS(null, 'cy', y);

      const which = this.focusedCircle.getAttributeNS(null, 'data-path-circle');
      this.points[`${which}PointX`] = x;
      this.points[`${which}PointY`] = y;

      this.updatePath();
    });
  }

  #addButtonListeners() {
    document.querySelector('[data-button="reset-path"]')
      .addEventListener('click', () => this.resetPath());

    const focusButtonOnClick = (event) => {
      const which = event.currentTarget.getAttribute('data-button-focus');

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

  #addPathListeners() {
    const onPathInputUpdate = (event) => {
      const ct = event.currentTarget;
      const parameter = ct.parentElement.getAttribute('data-point-inputs-container');
      this.points[parameter] = Number(ct.value);

      this.updatePath();
    }

    const names = ['startPointX', 'startPointY', 
      'controlPointX', 'controlPointY', 'endPointX', 'endPointY'];

    for(let val of names) {
      document.querySelector(`[data-point-inputs-container="${val}"`)
        .querySelectorAll('input[type="number"], input[type="range"]')
        .forEach((input) => {
          input.value = this.points[val];
          input.addEventListener('input', (event) => onPathInputUpdate(event));
        });
    }
  }

  #addPathMovementListeners() {
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
    for(let val of this.pointInputs)
      for (let val_2 of val.querySelectorAll('[type="range"], [type="number"]'))
        val_2.value = this.points[val.getAttribute('data-point-inputs-container')];
  }

  updateCircles() {
    for(let key in this.circles) {
      this.circles[key].setAttributeNS(null, 'cx', this.points[`${key}PointX`]);
      this.circles[key].setAttributeNS(null, 'cy', this.points[`${key}PointY`]);
    }
  }

  updatePath() {
    this.path.setAttributeNS(null, 'd', 
      `M ${this.points.startPointX},${this.points.startPointY}
       Q ${this.points.controlPointX},${this.points.controlPointY}
         ${this.points.endPointX},${this.points.endPointY}`
    );

    this.updatePointInputs();
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