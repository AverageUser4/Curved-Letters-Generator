import Path from './Path.js';

export default class CubicBezier extends Path {

  constructor(master, svg, index) {
    super(master, svg, index, 'cubic');
  }

  updatePath(invokedBy) {
    let d = `M ${this.points[0].x},${this.points[0].y} `;
    d += `C ${this.points[1].x},${this.points[1].y} `;
    d += `${this.points[2].x},${this.points[2].y} `;
    d += `${this.points[3].x},${this.points[3].y} `;

    this.pathElement.setAttributeNS(null, 'd', d);

    if(invokedBy !== 'input')
      this.updatePointInputs();
    if(invokedBy !== 'circle')
      this.updateCircles();
  }

}