const pointBases = {
  spx: 10, spy: 250,
  cpx: 250, cpy: 100,
  epx: 490, epy: 250
};

export default class PathHandler {

  svg = document.querySelector('svg');
  path = document.querySelector('path');
  text = document.querySelector('text');

  focusedCircle = null;
  startCircle = document.querySelector('[data-path-circle="start"]');
  controlCircle = document.querySelector('[data-path-circle="control"]');
  endCircle = document.querySelector('[data-path-circle="end"]');

  allFocusButtons = document.querySelectorAll('[data-button-focus]');

  textAutoAdjust = true;
  textXInputs = 
    document.querySelector('[data-text-inputs-container="textX"')
    .querySelectorAll('input[type="number"], input[type="range"]');

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

    this.eventTarget.requestUpdate('readableSource');
  }

  #addCircleListeners() {
    const circles = document.querySelectorAll('[data-path-circle]');

    window.addEventListener('click', (event) => {
      for(let val of circles) {
        if(val === this.focusedCircle) {
          this.focusedCircle = null;
          for(let val_2 of this.allFocusButtons)
            val_2.classList.remove('focus-button--active');
        }
        else if(val === event.target) {
          this.focusedCircle = val;
          for(let val_2 of this.allFocusButtons)
            if(
                val_2.getAttribute('data-button-focus') === 
                this.focusedCircle.getAttributeNS(null, 'data-path-circle')  
              )
            val_2.classList.add('focus-button--active');
        }
      }
    });

    window.addEventListener('mousemove', (event) => {
      if(!this.focusedCircle)
        return;

      const svgRect = this.svg.getBoundingClientRect();

      const x = event.pageX - svgRect.x;
      const y = event.pageY - svgRect.y;

      this.focusedCircle.setAttributeNS(null, 'cx', x);
      this.focusedCircle.setAttributeNS(null, 'cy', y);

      switch(this.focusedCircle.getAttributeNS(null, 'data-path-circle')) {
        case 'start':
          this.points.startPointX = x;
          this.points.startPointY = y;
          break;

        case 'control':
          this.points.controlPointX = x;
          this.points.controlPointY = y;
          break;

        case 'end':
          this.points.endPointX = x;
          this.points.endPointY = y;
          break;
      }

      this.updatePath();
    });
  }

  #addButtonListeners() {
    document.querySelector('[data-button="reset-path"]').addEventListener('click', () => this.resetPath());

    for(let val of this.allFocusButtons) {
      val.addEventListener('click', (event) => {
        const which = event.currentTarget.getAttribute('data-button-focus');

        if(this.focusedCircle === this[`${which}Circle`]) {
          event.currentTarget.classList.remove('focus-button--active');
          this.focusedCircle = null;
          return;
        }

        for(let val of this.allFocusButtons)
          val.classList.remove('focus-button--active');

        event.currentTarget.classList.add('focus-button--active');

        this.focusedCircle = this[`${which}Circle`];

        event.stopPropagation();
      });
    }

    const centerCheckbox = document.querySelector('[data-config="textCenter"]');
    centerCheckbox.checked = true;
    centerCheckbox.addEventListener('change', () => {
      this.textAutoAdjust = centerCheckbox.checked;
    });
  }

  #addPathListeners() {
    const names = ['startPointX', 'startPointY', 
      'controlPointX', 'controlPointY', 'endPointX', 'endPointY'];

    for(let val of names) {
      const inputContainer = 
        document.querySelector(`[data-point-inputs-container="${val}"`);

      const numberInput = inputContainer.querySelector('input[type="number"]');
      const rangeInput = inputContainer.querySelector('input[type="range"]');

      numberInput.value = rangeInput.value = this.points[val];

      numberInput.addEventListener('input', (event) => this.onPathInputUpdate(event));
      rangeInput.addEventListener('input', (event) => this.onPathInputUpdate(event));
    }
  }

  resetPath() {
    this.points.startPointX = pointBases.spx;
    this.points.startPointY = pointBases.spy;
    this.points.controlPointX = pointBases.cpx;
    this.points.controlPointY = pointBases.cpy;
    this.points.endPointX = pointBases.epx;
    this.points.endPointY = pointBases.epy;

    this.updatePath();
  }

  updatePath(dontAdjust = false) {
    this.path.setAttributeNS(null, 'd', 
      `M ${this.points.startPointX},${this.points.startPointY}
       Q ${this.points.controlPointX},${this.points.controlPointY}
         ${this.points.endPointX},${this.points.endPointY}`
    );

    if(!dontAdjust && this.textAutoAdjust) {
      this.text.setAttributeNS(null, 'x', this.points.controlPointX);
      for(let val of this.textXInputs)
        val.value = this.points.controlPointX;
    }

    this.eventTarget.requestUpdate('readableSource');
    this.updatePointInputs();
    this.updateCircles();
  }

  updatePointInputs() {
    for(let val of this.pointInputs)
      for (let val_2 of val.querySelectorAll('[type="range"], [type="number"]'))
        val_2.value = this.points[val.getAttribute('data-point-inputs-container')];
  }

  updateCircles() {
    this.startCircle.setAttributeNS(null, 'cx', this.points.startPointX);
    this.startCircle.setAttributeNS(null, 'cy', this.points.startPointY);
    this.controlCircle.setAttributeNS(null, 'cx', this.points.controlPointX);
    this.controlCircle.setAttributeNS(null, 'cy', this.points.controlPointY);
    this.endCircle.setAttributeNS(null, 'cx', this.points.endPointX);
    this.endCircle.setAttributeNS(null, 'cy', this.points.endPointY);
  }

  onPathInputUpdate(event) {
    const ct = event.currentTarget;
    const value = ct.value;

    const parameter = ct.parentElement.getAttribute('data-point-inputs-container');
    this.points[parameter] = Number(value);

    this.updatePath();
  }

  movePath(offsetX, offsetY) {
    for(let key in this.points) {
      if(key.endsWith('PointX'))
        this.points[key] += offsetX;
      else if(key.endsWith('PointY'))
        this.points[key] += offsetY
    }

    this.updatePath(true);
  }

}