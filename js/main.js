import nill from './scripts/setup.js';
import SVGHandler from './classes/SVGHandler.js';
import PathHandler from './classes/PathHandler.js';
import PathUIHandler from './classes/PathUIHandler.js';



class Master {

  constructor() {
    this.svgHandler = new SVGHandler(this);
    this.pathHandler =  new PathHandler(this, document.querySelector('svg'));
    this.pathUIHandler = new PathUIHandler(this);

    // this.pathUIHandler.addPathUI({ index: 0, points: [{ x: 10, y: 10}, {x: 20, y: 20}, {x: 30, y: 30}] });
    this.pathHandler.addPath();
  }

  request = (what, data) => {
    switch(what) {
      case 'addPathUI':
        this.pathUIHandler.addPathUI(data);
        break;

      case 'removePathUI':
        this.pathUIHandler.removePathUI(data);
        break;

      // case 'movePath':
      //   this.pathHandler.movePath(data.textOffsetX, data.textOffsetY);
      //   break;

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