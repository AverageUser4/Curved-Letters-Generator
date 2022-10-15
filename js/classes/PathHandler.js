import Path from './Path.js';

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
    // switch(kind) {
    //   case 'quadratic':
    //     this.allPaths.set(this.nextPathIndex, new QuadraticBezier(master, svg, this.nextPathIndex));
    //     break;

    //   case 'cubic':
    //     this.allPaths.set(this.nextPathIndex, new CubicBezier(master, svg, this.nextPathIndex));
    //     break;

    //   case 'ellipsis':
    //     this.allPaths.set(this.nextPathIndex, new Ellipsis(master, svg, this.nextPathIndex));
    //     break;

    //   default:
    //     console.error(`Unknown path kind '${kind}'.`);
    // }

    this.allPaths.set(this.nextPathIndex, new Path(this.master, this.svgElement, this.nextPathIndex));


    this.nextPathIndex++;
  }

}