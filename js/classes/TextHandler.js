class TextHandler {

  constructor() {
    this.text = document.querySelector('text');
    
    this.textInput = document.querySelector('input[type="text"]');

    this.textInput.addEventListener('input', () => this.onTextInput());
  }

  onTextInput() {
    this.text.children[0].textContent = this.textInput.value;
  }

}

export default new TextHandler;