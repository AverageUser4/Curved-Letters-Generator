import QuadraticBezier from './QuadraticBezier.js';
import CubicBezier from './CubicBezier.js';
import Ellipsis from './Ellipsis.js';

export default class PathHandler {

  svgElement;

  nextPathIndex = 1;
  allPaths = new Map();

  constructor(master, svgElement) {
    this.master = master;
    this.svgElement = svgElement;

    this.#addButtonListeners();
  }

  #addButtonListeners() {
    const addButtons = document.querySelectorAll('[data-add-button]');

    for(let button of addButtons) {
      button.addEventListener('click', () => {
        this.addPath(button.getAttribute('data-add-button'));
      });
    }
  }

  addPath(kind) {
    switch(kind) {
      case 'quadratic':
        this.allPaths.set(this.nextPathIndex, new QuadraticBezier(this.master, this.svgElement, this.nextPathIndex));
        break;

      case 'cubic':
        this.allPaths.set(this.nextPathIndex, new CubicBezier(this.master, this.svgElement, this.nextPathIndex));
        break;

      case 'ellipsis':
        // this.allPaths.set(this.nextPathIndex, new Ellipsis(this.master, this.svgElement, this.nextPathIndex));
        console.log('not supported yet'); return;
        break;

      default:
        console.error(`Unknown path kind '${kind}'.`);
    }

    const buf = this.nextPathIndex;
    document.querySelector(`[data-path-ui="${buf}"]`)
      .querySelector('[data-button="remove-path"]')
      .addEventListener('click', () => this.removePath(buf));

    this.nextPathIndex++;
  }

  removePath(index) {
    this.allPaths.get(index).removeFromSVG();
    this.allPaths.delete(index);

    this.master.request('removePathUI', { index });
  }

  moveAllPaths(offsetX, offsetY) {
    for(let [key, path] of this.allPaths) {
      path.movePath(offsetX, offsetY);
    }
  }

}