const spx = 10;
const spy = 250;
const cpx = 250;
const cpy = 100;
const epx = 490;
const epy = 250;

class PathAndTextHandler {

  points = {};

  constructor() {
    this.path = document.querySelector('path');
    this.text = document.querySelector('text');
    this.pathResetButton = document.querySelector('[data-reset-button="path"]');

    this.resetPath();

    this.pathInputsContainer = document.querySelector('[data-path-inputs-container]');

    for(let key in this.points) {
      const inputContainer = 
        this.pathInputsContainer.querySelector(`[data-inputs-container="${key}"`);

      const numberInput = inputContainer.querySelector('input[type="number"]');
      const rangeInput = inputContainer.querySelector('input[type="range"]');

      numberInput.value = rangeInput.value = this.points[key];

      numberInput.addEventListener('input', (event) => this.onInputUpdate(event));
      rangeInput.addEventListener('input', (event) => this.onInputUpdate(event));
    }

    this.pathResetButton.addEventListener('click', () => this.resetPath());

    this.updatePath();
  }

  resetPath() {
    this.points.startPointX = spx;
    this.points.startPointY = spy;
    this.points.controlPointX = cpx;
    this.points.controlPointY = cpy;
    this.points.endPointX = epx;
    this.points.endPointY = epy;

    this.updatePath();
  }

  updatePath() {
    this.path.setAttributeNS(null, 'd', 
      `M ${this.points.startPointX},${this.points.startPointY}
       Q ${this.points.controlPointX},${this.points.controlPointY}
         ${this.points.endPointX},${this.points.endPointY}`
    );

    // if(autoCenter)
      this.text.setAttributeNS(null, 'x', this.points.controlPointX);
  }

  onInputUpdate(event) {
    const ct = event.currentTarget;
    const value = ct.value;

    const parameter = ct.parentElement.getAttribute('data-inputs-container');
    this.points[parameter] = value;

    this.updatePath();
  }

}

export default new PathAndTextHandler;