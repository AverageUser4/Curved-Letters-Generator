export default class SVGHandler {

  svg = document.querySelector('svg');

  bottom = document.querySelector('[data-svg-stretch="bottom"]');
  right = document.querySelector('[data-svg-stretch="right"]');
  bottomRight = document.querySelector('[data-svg-stretch="bottomRight"]');

  resizeDirection = null;
  latestMousePosition = { x: 0, y: 0 }

  text = document.querySelector('text');

  sizeInputs = document.querySelectorAll(['[data-svg-inputs-container]']);

  svgInfo = {
    width: 500,
    height: 500,
  };

  constructor(theEventTarget) {
    this.eventTarget = theEventTarget;

    this.#addButtonListeners();
    this.#addResizeListeners();
  }

  #addButtonListeners() {
    document.querySelector('[data-button="crop-svg"]').addEventListener('click', () => this.cropSVG());
    document.querySelector('[data-button="reset-svg"]').addEventListener('click', () => {
      this.svg.setAttributeNS(null, 'viewBox', `0 0 500 500`);
      this.svg.setAttributeNS(null, 'width', 500);
      this.svg.setAttributeNS(null, 'height', 500);
      // this.svg.removeAttributeNS(null, 'height');
      this.eventTarget.requestUpdate('pointInputs');
      this.eventTarget.requestUpdate('readableSource');
      this.updateSizeInputs();
    });
  }

  #addResizeListeners() {
    // input
    const widthInput = document.querySelector(['[data-svg-input="width"]']);
    const heightInput = document.querySelector(['[data-svg-input="height"]']);

    widthInput.querySelectorAll('[type="range"], [type="number]"')
      .forEach((input) => {
        input.addEventListener('input', (event) => {
          this.changeSizeOfSVG(widthInput.children[1].value, heightInput.children[1].value);
        });
      })
      
    // drag
    window.addEventListener('mousedown', (event) => {
      if(event.button != 0)
        return;

      this.resizeDirection = event.target.getAttribute('data-svg-stretch');

      this.latestMousePosition.x = event.clientX;
      this.latestMousePosition.y = event.clientY;
    });

    window.addEventListener('mouseup', () => this.resizeDirection = null);

    window.addEventListener('mousemove', (event) => {
      if(!this.resizeDirection)
        return;

      const svgRect = this.svg.getBoundingClientRect();
      let newWidth = Math.min(Math.max(Math.round(event.clientX - svgRect.x), 10), 2000);
      let newHeight = Math.min(Math.max(Math.round(event.clientY - svgRect.y), 10), 2000);

      if(this.resizeDirection === 'bottom') {
        this.changeSizeOfSVG(svgRect.width, newHeight);
      } else if(this.resizeDirection === 'right') {
        this.changeSizeOfSVG(newWidth, svgRect.height);
      } else {
        this.changeSizeOfSVG(newWidth, newHeight);
      }

      this.updateSizeInputs();
    });
  }

  changeSizeOfSVG(width, height) {
    this.svg.setAttributeNS(null, 'width', width);
    this.svg.setAttributeNS(null, 'height', height);
    this.svg.setAttributeNS(null, 'viewBox', `0 0 ${width} ${height}`);

    this.eventTarget.requestUpdate('adjustUIPosition');
  }

  cropSVG() {
    const svgRect = this.svg.getBoundingClientRect();
    const textRect = this.text.getBoundingClientRect();

    let textOffsetX = Math.round(Math.abs(svgRect.x - textRect.x));
    let textOffsetY = Math.round(Math.abs(svgRect.y - textRect.y));

    if(textRect.x > svgRect.x)
      textOffsetX *= -1;

    if(textRect.y > svgRect.y)
      textOffsetY *= -1;

    this.eventTarget.requestUpdate('movePath', { textOffsetX: textOffsetX, textOffsetY: textOffsetY });

    const w = Math.round(textRect.width);
    const h = Math.round(textRect.height);
    this.svg.setAttributeNS(null, 'viewBox', `0 0 ${w} ${h}`);
    this.svg.setAttributeNS(null, 'width', w);
    this.svg.setAttributeNS(null, 'height', h);

    this.updateSizeInputs();
    this.eventTarget.requestUpdate('readableSource');
    this.eventTarget.requestUpdate('adjustUIPosition');
  }

  updateSizeInputs() {
    const update = (input, which) => input.value = this.svg.getAttributeNS(null, which);

    for(let container of this.sizeInputs)
      container.querySelectorAll('[type="range"], [type="number"]')
        .forEach((input) => update(input, container.getAttribute('data-svg-inputs-container')));
  }
}