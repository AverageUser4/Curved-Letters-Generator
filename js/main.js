import nill from './scripts/setup.js';
import PathHandler from './classes/PathHandler.js';
import SVGHandler from './classes/SVGHandler.js';
import UIHandler from './classes/UIHandler.js';



class Master {

  constructor() {
    this.pathHandler =  new PathHandler(this);
    this.svgHandler = new SVGHandler(this);
    // this.uiHandler = new UIHandler(this);
  }

  request = (what, info) => {
    switch(what) {
      case 'movePath':
        this.pathHandler.movePath(info.textOffsetX, info.textOffsetY);
        break;

      case 'path':
        this.pathHandler.updatePath();
        break;

      case 'pointInputs':
        this.pathHandler.updatePointInputs();
        break;

      default:
        console.error(`Unknown action requested in Master object - '${what}'.`);
    }
  };

}

const master = new Master();