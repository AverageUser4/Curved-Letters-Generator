export default class TextHandler {

  pathElement = document.querySelector('path');
  textElement = document.querySelector('text');

  constructor(theEventTarget) {
    this.eventTarget = theEventTarget;

    this.textElement.children[0].textContent = 'My Curved Text :)';
    this.textElement.style = 'font-size: 24px;';

    this.#addTextListeners();
  }

  #addTextListeners() {
    document.querySelector('[data-text-input="textContent"]')
      .addEventListener('input', (event) => {
        this.textElement.children[0].textContent = event.currentTarget.value;
      });

    document.querySelector('[data-text-input="style"]')
      .addEventListener('input', 
        (event) =>  this.textElement.style = event.currentTarget.value);

    const inputX = document.querySelector('[data-text-input="x"]');
    inputX.addEventListener('input', (event) => {
      this.textElement.setAttributeNS(null, 'x', event.currentTarget.value);
    });

    // change x when scrolling over the path
    const onWheel = (event) => {
      event.preventDefault();

      const currentX = Number(this.textElement.getAttributeNS(null, 'x'));
      const movementAmount = event.wheelDeltaY > 0 ? 5 : -5;

      this.textElement.setAttributeNS(null, 'x', currentX + movementAmount);
    }

    this.pathElement.addEventListener('wheel', (event) => onWheel(event), { passive: false });
    // for some reason doesn't always fire when it's only on path
    this.textElement.addEventListener('wheel', (event) => onWheel(event), { passive: false });
  }

}