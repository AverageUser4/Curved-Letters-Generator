export default class UIHandler {

  constructor(theEventTarget) {
    this.eventTarget = theEventTarget;

    this.eventTarget.addEventListener('addPathUI', (event) => this.addPathUI(event));
    this.eventTarget.addEventListener('removePathUI', (event) => this.removePathUI(event));
  }

  addPathUI() {

  }

  RemovePathUI() {

  }

}