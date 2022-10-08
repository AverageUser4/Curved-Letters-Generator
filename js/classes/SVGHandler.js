export default class SVGHandler {

  svg = document.querySelector('svg');

  bottom = document.querySelector('.the-main__svg-stretch--bottom');
  right = document.querySelector('.the-main__svg-stretch--right');
  bottomRight = document.querySelector('.the-main__svg-stretch--bottom-and-right');

  resizeDirection = null;
  initialMousePosition = { x: 0, y: 0 }

  text = document.querySelector('text');

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
      this.svg.removeAttributeNS(null, 'height');
      this.eventTarget.requestUpdate('pointInputs');
      this.eventTarget.requestUpdate('readableSource');
    });
  }

  #addResizeListeners() {
    window.addEventListener('mousedown', (event) => {
      if(event.button != 0)
        return;

      switch(event.target) {
        case this.bottom:
          this.resizeDirection = 'bottom';
          break;

        case this.right:
          this.resizeDirection = 'right';
          break;

        case this.bottomRight:
          this.resizeDirection = 'bottomRight';
          break;

        default:
          return;
      }

      this.initialMousePosition.x = event.pageX;
      this.initialMousePosition.y = event.pageY;
    });

    window.addEventListener('mouseup', () => this.resizeDirection = null);

    window.addEventListener('mousemove', (event) => {
      if(!this.resizeDirection)
        return;

      const svgRect = this.svg.getBoundingClientRect();
      let newWidth = Math.round(event.pageX - svgRect.x);
      newWidth = newWidth < 10 ? 10 : newWidth;
      let newHeight = Math.round(event.pageY - svgRect.y);
      newHeight = newHeight < 10 ? 10 : newHeight;

      if(this.resizeDirection === 'bottom') {
        this.svg.setAttributeNS(null, 'height', newHeight);
        this.svg.setAttributeNS(null, 'viewBox', `0 0 ${svgRect.width} ${newHeight}`);
      } else if(this.resizeDirection === 'right') {
        this.svg.setAttributeNS(null, 'width', newWidth);
        this.svg.setAttributeNS(null, 'viewBox', `0 0 ${newWidth} ${svgRect.height}`);
      } else {
        this.svg.setAttributeNS(null, 'width', newWidth);
        this.svg.setAttributeNS(null, 'height', newHeight);
        this.svg.setAttributeNS(null, 'viewBox', `0 0 ${newWidth} ${newHeight}`);
      }
    });
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

    this.eventTarget.requestUpdate('readableSource');
  }

}