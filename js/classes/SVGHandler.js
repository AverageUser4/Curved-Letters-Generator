const svgInfoBases = {
  width: 500,
  height: 500
};

export default class SVGHandler {

  svg = document.querySelector('svg');
  text = document.querySelector('text');

  bottom = document.querySelector('[data-svg-stretch="bottom"]');
  right = document.querySelector('[data-svg-stretch="right"]');
  bottomRight = document.querySelector('[data-svg-stretch="bottomRight"]');

  resizeDirection = null;
  latestMousePosition = { x: 0, y: 0 }

  sizeInputs = document.querySelectorAll(['[data-svg-input]']);

  svgInfo = {
    width: 500,
    height: 500,
  };

  constructor(master) {
    this.master = master;

    this.#addButtonListeners();
    this.#addResizeListeners();
  }

  #addButtonListeners() {
    document.querySelector('[data-button="crop-svg"]').addEventListener('click', 
      () => this.cropSVG());
    document.querySelector('[data-button="reset-svg"]').addEventListener('click', 
      () => this.changeSizeOfSVG(500, 500));
  }

  #addResizeListeners() {
    // input
    // for(let container of this.sizeInputsContainer) {
    //   const input = container.querySelector('input[type="number"]');
    //   const which = input.getAttribute('data-svg-input');
    //   input.value = this.svgInfo[which];
    //   input.addEventListener('input', () => {
    //     this.changeSizeOfSVG(widthInput.value, heightInput.value);
    //   });
    // }
      
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
      let newWidth = event.clientX - svgRect.x;
      let newHeight = event.clientY - svgRect.y;

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
    width = Math.min(Math.max(Math.round(width), 10), 2000);
    height = Math.min(Math.max(Math.round(height), 10), 2000);

    this.svg.setAttributeNS(null, 'width', width);
    this.svg.setAttributeNS(null, 'height', height);
    this.svg.setAttributeNS(null, 'viewBox', `0 0 ${width} ${height}`);

    this.master.request('adjustUIPosition');
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

    this.master.request('movePath', { textOffsetX: textOffsetX, textOffsetY: textOffsetY });

    const w = Math.round(textRect.width);
    const h = Math.round(textRect.height);
    this.svg.setAttributeNS(null, 'viewBox', `0 0 ${w} ${h}`);
    this.svg.setAttributeNS(null, 'width', w);
    this.svg.setAttributeNS(null, 'height', h);

    this.updateSizeInputs();
    this.master.request('adjustUIPosition');
  }

  updateSizeInputs() {
    const update = (input, which) => input.value = this.svg.getAttributeNS(null, which);

    for(let input of this.sizeInputs)
      update(input, input.getAttribute('data-svg-input'));
  }

}