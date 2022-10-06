export default class TextHandler {

  textElement = document.querySelector('text');
  textInfo = {
    textContent: 'My Curved Text :)',
    fontSize: 32,
    x: 250,
    // textAnchor: 'middle',
  };

  constructor(theEventTarget) {
    this.eventTarget = theEventTarget;

    this.eventTarget.addEventListener('text', () => this.updateText());

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
    
    // const textAnchorSelect = document.querySelector('[data-input="textAnchor"');
    // textAnchorSelect.selectedIndex = 0;
    // textAnchorSelect.addEventListener('change', () => {
    //   this.textInfo.textAnchor = textAnchorSelect.value;
    //   this.updateText();
    // });
  }

  updateText() {
    this.textElement.children[0].textContent = this.textInfo.textContent;
    this.textElement.style.fontSize = this.textInfo.fontSize + 'px';
    this.textElement.setAttributeNS(null, 'x', this.textInfo.x);
    // this.textElement.setAttributeNS(null, 'text-anchor', this.textInfo.textAnchor);

    this.eventTarget.requestUpdate('readableSource');
  }

}