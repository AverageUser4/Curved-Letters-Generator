export default class PathUIHandler {

  controlsContainer = document.querySelector('[data-path-controls]');

  constructor(master) {
    this.master = master;
  }

  addPathUI(data) {
    // data.index, data.points, data.color, data.kind
    const container = document.createElement('article');
    container.setAttribute('data-path-ui', data.index);
    container.classList.add('path-ui');

    let prettyKind = '';
    switch(data.kind) {
      case 'quadratic':
      case 'cubic':
        prettyKind = data.kind.charAt(0).toUpperCase() + '. Bezier';
        break;

      default:
        prettyKind = data.kind.replace(data.kind.charAt(0), data.kind.charAt(0).toUpperCase());
    }

    container.innerHTML += `
      <div class="path-ui__top">

        <div class="horizontal-flex">

          <div style="background-color: ${data.color};" class="path-ui__color-indicator"></div>

          <h3 class="path-ui__heading">${data.index}: ${prettyKind}</h3>

        </div>

        <button class="path-ui__remove-path-button" data-button="remove-path">X</button>

      </div>
    `;

    const pointsList = document.createElement('ul');
    pointsList.classList.add('path-ui__points-list');

    for(let i = 0; i < data.points.length; i++) {
      pointsList.innerHTML += `
        <li class="path-ui__point">

          <button class="focus-button" data-focus-button="${i}">${i}</button>

          <div class="horizontal-flex">
      
            <label class="inset-label">
              <span>x:</span>
              <input data-point-input="${i}-x" type="number" value="${data.points[i].x}" step="50" min="-1000" max="1000">
            </label>
      
            <label class="inset-label">
              <span>y:</span>
              <input data-point-input="${i}-y" type="number" value="${data.points[i].y}" step="50" min="-1000" max="1000">
            </label>
      
          </div>

        </li>
      `;
    }

      container.append(pointsList);

      pointsList.innerHTML += `<li class="path-ui__point"><button data-button="reset-path">RESET</button></li>`;

      container.innerHTML += `
        <section class="path-ui__text-area-container">
          <textarea class="path-ui__text-area" data-text-input="textContent">My Curved Text :)</textarea>
        </section>
      `;

      container.innerHTML += `
        <section class="path-ui__inputs-container">

          <div class="horizontal-flex">
      
            <label class="inset-label">
              <span>x:</span>
              <input data-text-input="x" type="number" step="50" min="-1000" max="1000">
            </label>
      
            <label class="inset-label">
              <span>s:</span>
              <input data-text-input="size" type="number" step="4" min="1" max="600"></input>
            </label>
      
          </div>
      
        </section>
      `;

      container.innerHTML += `
        <section class="path-ui__text-area-container">
          <textarea class="path-ui__text-area" data-text-input="style" placeholder="letter-spacing, fill, etc."></textarea>
        </section>
      `;

    this.controlsContainer.append(container);
  }

  removePathUI(data) {
    console.log(data)
    document.querySelector(`[data-path-ui="${data.index}"]`).remove();
  }

}