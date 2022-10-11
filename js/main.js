import nill from './scripts/setup.js';
import PathHandler from './classes/PathHandler.js';
import TextHandler from './classes/TextHandler.js';
import SVGHandler from './classes/SVGHandler.js';
import UIPositionHandler from './classes/UIPositionHandler.js';

//////////////////////////////////////////////////////////////
const theEventTarget = new EventTarget();

theEventTarget.requestUpdate = (updateName, actionParameters) => {
  const event = new Event(updateName);
  event.actionParameters = actionParameters;
  theEventTarget.dispatchEvent(event);
};
//////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////
const svg = document.querySelector('svg');
const copySourceButton = document.querySelector('[data-button="copy-source"]');

copySourceButton.addEventListener('click', () => {
  // clean up the svg and copy it to clipboard
  const id = `ctg-${Math.random().toFixed(5)}`;

  const newSVG = svg.cloneNode(false);
  newSVG.removeAttributeNS(null, 'class');
  newSVG.removeAttributeNS(null, 'height');

  const newPath = svg.querySelector('path').cloneNode(false);
  newPath.removeAttributeNS(null, 'data-path');
  newPath.removeAttributeNS(null, 'stroke');
  newPath.setAttributeNS(null, 'id', id);

  const newText = svg.querySelector('text').cloneNode(false);

  const newTextPath = svg.querySelector('textPath').cloneNode(true);
  newTextPath.removeAttributeNS(null, 'data-text-path');
  newTextPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id);

  newText.appendChild(newTextPath);

  newSVG.appendChild(newPath);
  newSVG.appendChild(newText);

  navigator.clipboard.writeText(newSVG.outerHTML);

  copySourceButton.textContent = 'COPIED!';
  setTimeout(() => copySourceButton.textContent = 'COPY SOURCE', 800);
});
//////////////////////////////////////////////////////////////


const pathHandler =  new PathHandler(theEventTarget);
const textHandler = new TextHandler(theEventTarget);
const svgHandler = new SVGHandler(theEventTarget);
const uiPositionHandler = new UIPositionHandler(theEventTarget);

