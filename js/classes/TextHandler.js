export default class TextHandler {

  textElement = document.querySelector('text');

  constructor(theEventTarget) {
    this.eventTarget = theEventTarget;

    this.textElement.children[0].textContent = 'My Curved Text :)';
    this.textElement.style = 'font-size: 32px;';
    this.textElement.setAttributeNS(null, 'x', 0);

    this.#addTextListeners();
  }

  #addTextListeners() {
    document.querySelector('[data-text-inputs-container="textContent"').children[0]
      .addEventListener('input', (event) => {
        this.textElement.children[0].textContent = event.currentTarget.value;
      });

    document.querySelector('[data-text-inputs-container="style"')
      .querySelector('textarea')
      .addEventListener('input', 
        (event) =>  this.textElement.style = event.currentTarget.value);

    document.querySelector('[data-text-inputs-container="textX"')
      .querySelectorAll('input[type="number"], input[type="range"]')
      .forEach((input) => {
        input.value = this.textElement.getAttributeNS(null, 'x');
        input.addEventListener('input', (event) => {
          this.textElement.setAttributeNS(null, 'x', event.currentTarget.value);
        });
      });
  }

}