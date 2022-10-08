export default class TextHandler {

  textElement = document.querySelector('text');

  textInfo = {
    textElement: null,
    eventTarget: null,
    _textContent: '',
    _style: '',
    _x: 0,

    get textContent() {
      return this._textContent;
    },
    set textContent(value) {
      this._textContent = value;
      this.textElement.children[0].textContent = value;
      this.eventTarget.requestUpdate('readableSource');
    },

    get style() {
      return this._style;
    },
    set style(value) {
      this._style = value;
      this.textElement.style = value;
      this.eventTarget.requestUpdate('readableSource');
    },

    get x() {
      return this._x;
    },
    set x(value) {
      this._x = value;
      this.textElement.setAttributeNS(null, 'x', value);
      this.eventTarget.requestUpdate('readableSource');
    },

  };

  constructor(theEventTarget) {
    this.eventTarget = theEventTarget;

    this.textInfo.textElement = this.textElement;
    this.textInfo.eventTarget = this.eventTarget;
    this.textInfo.textContent = 'My Curved Text :)';
    this.textInfo.style = 'font-size: 32px;';
    this.textInfo.x = 0;

    this.#addTextListeners();
  }

  #addTextListeners() {
    document.querySelector('[data-text-inputs-container="textContent"').children[0]
      .addEventListener('input', (event) => {
        this.textInfo.textContent = event.currentTarget.value;
      });

    document.querySelector('[data-text-inputs-container="style"')
      .querySelector('input[type="text"]')
      .addEventListener('input', 
        (event) => this.textInfo.style = event.currentTarget.value);

    document.querySelector('[data-text-inputs-container="textX"')
      .querySelectorAll('input[type="number"], input[type="range"]')
      .forEach((val) => {
        val.value = this.textInfo.x;
        val.addEventListener('input', () => {
          this.textInfo.x = val.value;
        });
      });
  }

}