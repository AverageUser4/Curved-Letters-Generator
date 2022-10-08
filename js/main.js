import nill from './scripts/setup.js';
import PathHandler from './classes/PathHandler.js';
import TextHandler from './classes/TextHandler.js';
import SVGHandler from './classes/SVGHandler.js';

const svg = document.querySelector('svg');
const readableSource = document.querySelector('.the-main__readable-source-container');

const theEventTarget = new EventTarget();

theEventTarget.requestUpdate = (updateName, actionParameters) => {
  const event = new Event(updateName);
  event.actionParameters = actionParameters;
  theEventTarget.dispatchEvent(event);
};

theEventTarget.addEventListener('readableSource', () => {
  let source = svg.outerHTML
    .replace('stroke="red"', '')
    .replace('class="the-main__svg"', '')
    .replace('data-path="1"', '')
    .replace('data-text-path="1"', '');

  readableSource.textContent = source
    .replace(
      source.slice(
        source.indexOf('<circle'),
        source.lastIndexOf('</circle>') + 9
      ), ''
    );
});

const pathHandler =  new PathHandler(theEventTarget);
const textHandler = new TextHandler(theEventTarget);
const svgHandler = new SVGHandler(theEventTarget);

class UIPositionHandler {

  eventTarget;

  svg = document.querySelector('svg');
  controlsContainer = document.querySelector('.the-main__controls-container');

  constructor(theEventTarget) {
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

const uiPositionHandler = new UIPositionHandler(theEventTarget);