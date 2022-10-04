const spx = 10;
const spy = 250;
const cpx = 250;
const cpy = 100;
const epx = 490;
const epy = 250;

class TheHandler {

  textAutoCenter = true;

  points = {};

  font = {
    textContent: 'My Curved Text :)',
    size: 32,
    x: 250,
    anchor: 'middle',
    family: null
  }

  constructor() {
    const path = document.querySelector('[data-path]');
    const textPath = document.querySelector('[data-text-path]');
    const id = `ctg-text-path-${Math.random()}`;
    path.setAttributeNS(null, 'id', id);
    textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id);

    this.svg = document.querySelector('svg');
    this.text = document.querySelector('text');
    this.readableSource = document.querySelector('#readable-source-container');
    this.updateReadableSource();

    const doubleInputsContainers = document.querySelectorAll('[data-number-and-range]');
    for(let val of doubleInputsContainers) {
      const number = val.querySelector('input[type="number"]');
      const range = val.querySelector('input[type="range"]');
    
      number.addEventListener('input', (event) => this.doubleInputUpdate(event));
      range.addEventListener('input', (event) => this.doubleInputUpdate(event));
    }


    const textContentInput = 
      document.querySelector('[data-text-inputs-container="textContent"').children[0];

    textContentInput.addEventListener('input', (event) => {
      this.font.textContent = event.currentTarget.value;
      this.updateText();
    });

    const fontSizeInputs = 
      document.querySelector('[data-text-inputs-container="fontSize"')
      .querySelectorAll('input[type="number"], input[type="range"]');

    for(let val of fontSizeInputs) {
      val.value = this.font.size;
      val.addEventListener('input', () => {
        this.font.size = val.value;
        this.updateText();
      });
    }

    const textXInputs = 
      document.querySelector('[data-text-inputs-container="textX"')
      .querySelectorAll('input[type="number"], input[type="range"]');

    this.anTextXInput = textXInputs[0];

    for(let val of textXInputs) {
      val.value = this.font.x;
      val.addEventListener('input', () => {
        this.font.x = val.value;
        this.updateText();
      });
    }

    const centerCheckbox = document.querySelector('[data-config="textCenter"]');
    centerCheckbox.checked = true;

    centerCheckbox.addEventListener('change', () => {
      this.textAutoCenter = centerCheckbox.checked;
    });
    
    const textAnchorSelect = document.querySelector('[data-input="textAnchor"');
    textAnchorSelect.selectedIndex = 0;

    textAnchorSelect.addEventListener('change', () => {
      this.font.anchor = textAnchorSelect.value;
      this.updateText();
    });
  

    this.path = document.querySelector('path');
    this.pathResetButton = document.querySelector('[data-reset-button="path"]');
    this.pathResetButton.addEventListener('click', () => this.resetPath());

    this.resetPath();

    for(let key in this.points) {
      const inputContainer = 
        document.querySelector(`[data-point-inputs-container="${key}"`);

      const numberInput = inputContainer.querySelector('input[type="number"]');
      const rangeInput = inputContainer.querySelector('input[type="range"]');

      numberInput.value = rangeInput.value = this.points[key];

      numberInput.addEventListener('input', (event) => this.pathInputUpdate(event));
      rangeInput.addEventListener('input', (event) => this.pathInputUpdate(event));
    }

    this.updatePath();
    this.updateText();

    document.querySelector('#crop-button').addEventListener('click', () => this.adjustSVGSize());
    document.querySelector('#svg-reset-button').addEventListener('click', () => {
      this.svg.setAttributeNS(null, 'viewBox', `0 0 500 500`);
      this.svg.setAttributeNS(null, 'width', 500);
    });
  }


  updateReadableSource() {
    this.readableSource.textContent = this.svg.outerHTML;
  }

  adjustSVGSize() {
    const svgRect = this.svg.getBoundingClientRect();
    const textRect = this.text.getBoundingClientRect();

    let textOffsetX = Math.round(Math.abs(svgRect.x - textRect.x));
    let textOffsetY = Math.round(Math.abs(svgRect.y - textRect.y));

    if(textRect.x > svgRect.x)
      textOffsetX *= -1;

    if(textRect.y > svgRect.y)
      textOffsetY *= -1;

    console.log(this.points)

    this.points.startPointX += textOffsetX;
    this.points.controlPointX += textOffsetX;
    this.points.endPointX += textOffsetX;
    this.points.startPointY += textOffsetY;
    this.points.controlPointY += textOffsetY;
    this.points.endPointY += textOffsetY;

    console.log(this.points)

    const w = textRect.width;
    const h = textRect.height;
    this.svg.setAttributeNS(null, 'viewBox', `0 0 ${w} ${h}`);
    this.svg.setAttributeNS(null, 'width', w);

    this.updatePath();
    this.updateText();
  }

  updateText() {
    this.text.children[0].textContent = this.font.textContent;
    this.text.style.fontSize = this.font.size + 'px';
    this.text.setAttributeNS(null, 'x', this.font.x);
    this.text.setAttributeNS(null, 'text-anchor', this.font.anchor);

    this.updateReadableSource();
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

    if(this.textAutoCenter)
      this.text.setAttributeNS(null, 'x', this.points.controlPointX);

    this.updateReadableSource();
  }

  pathInputUpdate(event) {
    const ct = event.currentTarget;
    const value = ct.value;

    const parameter = ct.parentElement.getAttribute('data-point-inputs-container');
    this.points[parameter] = Number(value);

    this.updatePath();
  }

  doubleInputUpdate(event) {
    const ct = event.currentTarget;
    const value = ct.value;
    
    for(let val of ct.parentElement.querySelectorAll('input'))
      val.value = value;
  }

}

export default new TheHandler;