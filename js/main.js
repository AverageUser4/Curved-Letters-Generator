import nill from './scripts/setup.js';
import PathHandler from './classes/PathHandler.js';
import TextHandler from './classes/TextHandler.js';
import SVGHandler from './classes/SVGHandler.js';
import UIPositionHandler from './classes/UIPositionHandler.js';

const svg = document.querySelector('svg');
const theEventTarget = new EventTarget();

theEventTarget.requestUpdate = (updateName, actionParameters) => {
  const event = new Event(updateName);
  event.actionParameters = actionParameters;
  theEventTarget.dispatchEvent(event);
};

const copySourceButton = document.querySelector('[data-button="copy-source"]');

copySourceButton.addEventListener('click', () => {
  let source = svg.outerHTML
    .replace('stroke="red"', '')
    .replace('class="the-main__svg"', '')
    .replace('data-path="1"', '')
    .replace('data-text-path="1"', '');

  source = source
    .replace(
      source.slice(
        source.indexOf('<circle'),
        source.lastIndexOf('</circle>') + 9
      ), ''
    );

  // copy entire svg, path, and text elements and 
  // remove unwanted attributes from them instead

  navigator.clipboard.writeText(source);
});

const pathHandler =  new PathHandler(theEventTarget);
const textHandler = new TextHandler(theEventTarget);
const svgHandler = new SVGHandler(theEventTarget);
const uiPositionHandler = new UIPositionHandler(theEventTarget);

