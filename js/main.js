import nill from './scripts/setup.js';

const svg = document.querySelector('svg');
const readableSource = document.querySelector('.the-main__readable-source-container');

const pointBases = {
  spx: 10, spy: 250,
  cpx: 250, cpy: 100,
  epx: 490, epy: 250
};

const textInfoObject = {};
const pointsObject = {};
const theEventTarget = new EventTarget();

function updateReadableSource() {
  let source = svg.outerHTML
    .replace('stroke="red"', '')
    .replace('class="the-main__svg"', '')
    .replace('data-path="1"', '')
    .replace('data-text-path="1"', '');

  readableSource.textContent = source
    .replace(
      source.slice(
        source.indexOf('<circle'),
        source.lastIndexOf('</circle>') + 9
      ), ''
    );
}

class TextHandler {

  textElement = document.querySelector('text');
  textInfo;

  constructor(theEventTarget, textInfoObject) {
    this.eventTarget = theEventTarget;

    this.textInfo = textInfoObject;
    this.textInfo.textContent = 'My Curved Text :)';
    this.textInfo.fontSize = 32;
    this.textInfo.x = 250;
    this.textInfo.textAnchor = 'middle';

    this.#addTextListeners();
    this.updateText();
  }

  #addTextListeners() {
    document.querySelector('[data-text-inputs-container="textContent"').children[0]
      .addEventListener('input', (event) => {
        this.textInfo.textContent = event.currentTarget.value;
        this.updateText();
      });

    const fontSizeInputs = 
      document.querySelector('[data-text-inputs-container="fontSize"')
      .querySelectorAll('input[type="number"], input[type="range"]');

    for(let val of fontSizeInputs) {
      val.value = this.textInfo.fontSize;
      val.addEventListener('input', () => {
        this.textInfo.fontSize = val.value;
        this.updateText();
      });
    }

    const textXInputs = 
      document.querySelector('[data-text-inputs-container="textX"')
      .querySelectorAll('input[type="number"], input[type="range"]');

    for(let val of textXInputs) {
      val.value = this.textInfo.x;
      val.addEventListener('input', () => {
        this.textInfo.x = val.value;
        this.updateText();
      });
    }
    
    const textAnchorSelect = document.querySelector('[data-input="textAnchor"');
    textAnchorSelect.selectedIndex = 0;
    textAnchorSelect.addEventListener('change', () => {
      this.textInfo.textAnchor = textAnchorSelect.value;
      this.updateText();
    });
  }

  updateText() {
    this.textElement.children[0].textContent = this.textInfo.textContent;
    this.textElement.style.fontSize = this.textInfo.fontSize + 'px';
    this.textElement.setAttributeNS(null, 'x', this.textInfo.x);
    this.textElement.setAttributeNS(null, 'text-anchor', this.textInfo.textAnchor);

    updateReadableSource();
  }

}

class PathHandler {

  focusedCircle = null;
  startCircle = document.querySelector('[data-path-circle="start"]');
  controlCircle = document.querySelector('[data-path-circle="control"]');
  endCircle = document.querySelector('[data-path-circle="end"]');

  allFocusButtons = document.querySelectorAll('[data-button-focus]');

  text = document.querySelector('text');
  path = document.querySelector('path');

  textAutoCenter = true;
  textXInputs = 
    document.querySelector('[data-text-inputs-container="textX"')
    .querySelectorAll('input[type="number"], input[type="range"]');

  pointInputs = document.querySelectorAll('[data-point-inputs-container]');
  points = {};

  constructor(theEventTarget, pointsObject) {
    this.points = pointsObject;
    this.eventTarget = theEventTarget;

    this.resetPath();

    this.#addPathListeners();
    this.#addButtonListeners();

    this.#addCircleListeners();

    updateReadableSource();

    const centerCheckbox = document.querySelector('[data-config="textCenter"]');
    centerCheckbox.checked = true;
    centerCheckbox.addEventListener('change', () => {
      this.textAutoCenter = centerCheckbox.checked;
    });
  }

  updatePointInputs() {
    for(let val of this.pointInputs)
      for (let val_2 of val.querySelectorAll('[type="range"], [type="number"]'))
        val_2.value = this.points[val.getAttribute('data-point-inputs-container')];
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

      const svgRect = svg.getBoundingClientRect();

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

    /*
      these should go to SVGHandler along with adjustSVGSize method
    */
    document.querySelector('[data-button="crop-svg"]').addEventListener('click', () => this.adjustSVGSize());
    document.querySelector('[data-button="reset-svg"]').addEventListener('click', () => {
      svg.setAttributeNS(null, 'viewBox', `0 0 500 500`);
      svg.setAttributeNS(null, 'width', 500);
      this.updatePointInputs();
    });

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
  }

  #addPathListeners() {
    const names = ['startPointX', 'startPointY', 
      'controlPointX', 'controlPointY', 'endPointX', 'endPointY']

    for(let val of names) {
      const inputContainer = 
        document.querySelector(`[data-point-inputs-container="${val}"`);

      const numberInput = inputContainer.querySelector('input[type="number"]');
      const rangeInput = inputContainer.querySelector('input[type="range"]');

      numberInput.value = rangeInput.value = this.points[val];

      numberInput.addEventListener('input', (event) => this.pathInputUpdate(event));
      rangeInput.addEventListener('input', (event) => this.pathInputUpdate(event));
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

  updatePath() {
    this.path.setAttributeNS(null, 'd', 
      `M ${this.points.startPointX},${this.points.startPointY}
       Q ${this.points.controlPointX},${this.points.controlPointY}
         ${this.points.endPointX},${this.points.endPointY}`
    );

    if(this.textAutoCenter) {
      this.text.setAttributeNS(null, 'x', this.points.controlPointX);
      for(let val of this.textXInputs)
        val.value = this.points.controlPointX;
    }

    updateReadableSource();
    this.updatePointInputs();
  }

  updateCircle(which) {
    this[`${which}Circle`].setAttributeNS(null, 'cx', this.points[`${which}PointX`]);
    this[`${which}Circle`].setAttributeNS(null, 'cy', this.points[`${which}PointY`]);
  }

  pathInputUpdate(event) {
    const ct = event.currentTarget;
    const value = ct.value;

    const parameter = ct.parentElement.getAttribute('data-point-inputs-container');
    this.points[parameter] = Number(value);

    this.updateCircle(parameter.slice(0, parameter.indexOf('Point')));

    this.updatePath();
  }

  movePath(offsetX, offsetY) {
    for(let key in this.points) {
      if(key.endsWith('PointX'))
        this.points[key] += offsetX;
      else if(key.endsWith('PointY'))
        this.points[key] += offsetY
    }
  }

  requestUpdate(updateName) {
    this.eventTarget.dispatchEvent(new Event(updateName));
  }

  adjustSVGSize() {
    const svgRect = svg.getBoundingClientRect();
    const textRect = this.text.getBoundingClientRect();

    let textOffsetX = Math.round(Math.abs(svgRect.x - textRect.x));
    let textOffsetY = Math.round(Math.abs(svgRect.y - textRect.y));

    if(textRect.x > svgRect.x)
      textOffsetX *= -1;

    if(textRect.y > svgRect.y)
      textOffsetY *= -1;

    this.movePath(textOffsetX, textOffsetY);

    const w = textRect.width;
    const h = textRect.height;
    svg.setAttributeNS(null, 'viewBox', `0 0 ${w} ${h}`);
    svg.setAttributeNS(null, 'width', w);

    this.updatePath();
    // this.updateText();
    this.updatePointInputs();

    this.requestUpdate('text');
    this.requestUpdate('path');
  }

}

class SVGHandler {

  constructor(theEventTarget) {
    this.eventTarget = theEventTarget;
  }

}

const pathHandler =  new PathHandler(theEventTarget, pointsObject);
const textHandler = new TextHandler(theEventTarget, textInfoObject);
const svgHandler = new SVGHandler(theEventTarget);