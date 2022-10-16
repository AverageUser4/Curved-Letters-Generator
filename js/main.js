import nill from './scripts/setup.js';
import SVGHandler from './classes/SVGHandler.js';
import PathHandler from './classes/PathHandler.js';
import PathUIHandler from './classes/PathUIHandler.js';

class Master {

  constructor() {
    this.svgHandler = new SVGHandler(this);
    this.pathHandler =  new PathHandler(this, document.querySelector('svg'));
    this.pathUIHandler = new PathUIHandler(this);

    this.pathHandler.addPath('quadratic');
  }

  request = (what, data) => {
    switch(what) {
      case 'addPathUI':
        this.pathUIHandler.addPathUI(data);
        break;

      case 'removePathUI':
        this.pathUIHandler.removePathUI(data);
        break;

      case 'removeGroupElement':
        this.pathHandler.removeGroupElement(data);
        break;

      case 'moveAllPaths':
        this.pathHandler.moveAllPaths(data.textOffsetX, data.textOffsetY);
        break;

      // case 'path':
      //   this.pathHandler.updatePath();
      //   break;

      // case 'pointInputs':
      //   this.pathHandler.updatePointInputs();
      //   break;

      default:
        console.error(`Unknown action requested in Master object - '${what}'.`);
    }
  };

}

const master = new Master();