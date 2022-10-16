const svgInfoBases = {
  width: 500,
  height: 500
};

export default class SVGHandler {

  svgElement = document.querySelector('svg');

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

      const svgRect = this.svgElement.getBoundingClientRect();
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

    this.svgElement.setAttributeNS(null, 'width', width);
    this.svgElement.setAttributeNS(null, 'height', height);
    this.svgElement.setAttributeNS(null, 'viewBox', `0 0 ${width} ${height}`);

    // this.master.request('adjustUIPosition');
  }

  cropSVG() {
    const textElements = this.svgElement.querySelectorAll('text');
    let minX = Number.MAX_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;

    let maxX = -Number.MAX_SAFE_INTEGER;
    let maxY = -Number.MAX_SAFE_INTEGER;

    for(let textElement of textElements) {
      const textRect = textElement.getBoundingClientRect();

      minX = Math.min(textRect.x, minX);
      minY = Math.min(textRect.y, minY);

      maxX = Math.max(textRect.right, maxX);
      maxY = Math.max(textRect.bottom, maxY);
    }

    const svgRect = this.svgElement.getBoundingClientRect();

    let textOffsetX = Math.round(Math.abs(svgRect.x - minX));
    let textOffsetY = Math.round(Math.abs(svgRect.y - minY));

    if(minX > svgRect.x)
      textOffsetX *= -1;

    if(minY > svgRect.y)
      textOffsetY *= -1;

    this.master.request('moveAllPaths', { textOffsetX, textOffsetY });

    // for some reason width and height are around 24px larger than they're supposed to
    // it probably has to do with padding of the container svg is in
    const w = Math.round(maxX + textOffsetX - 24);
    const h = Math.round(maxY + textOffsetY - 24);
    this.svgElement.setAttributeNS(null, 'viewBox', `0 0 ${w} ${h}`);
    this.svgElement.setAttributeNS(null, 'width', w);
    this.svgElement.setAttributeNS(null, 'height', h);

    this.updateSizeInputs();
    // this.master.request('adjustUIPosition');
  }

  updateSizeInputs() {
    const update = (input, which) => input.value = this.svgElement.getAttributeNS(null, which);

    for(let input of this.sizeInputs)
      update(input, input.getAttribute('data-svg-input'));
  }

}