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

/*
  TextHandler -> text properties setters -> updateReadableSource()

  SVGHandler -> reset-svg-button.click() -> updatePointInputs() & updateReadableSource()
  SVGHandler -> cropSVG -> movePath()

  PathHandler -> constructor() -> updateReadableSource()
  PathHandler -> updatePath() -> updateReadableSource()
*/