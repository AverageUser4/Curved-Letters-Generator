export default class UIPositionHandler {

  eventTarget;

  svg = document.querySelector('svg');
  controlsContainer = document.querySelector('.the-main__controls-container');

  constructor(theEventTarget) {

    return;

    this.eventTarget = theEventTarget;
    this.eventTarget.addEventListener('adjustUIPosition', () => this.adjustUIPosition());

    window.addEventListener('resize', () => this.adjustUIPosition());
  }

  adjustUIPosition() {
    if(
        this.svg.getBoundingClientRect().y < 
        this.controlsContainer.getBoundingClientRect().y
      ) {
        this.controlsContainer.style.gridTemplateColumns = 'repeat(4, auto)';
    }
  }

}