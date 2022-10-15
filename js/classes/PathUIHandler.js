export default class PathUIHandler {

  controlsContainer = document.querySelector('[data-controls-container]');

  constructor(master) {
    this.master = master;
  }

  addPathUI(data) {
    // data.index, data.points, data.kind
    const container = document.createElement('article');
    container.setAttribute('data-path-ui', data.index);
    container.classList.add('path-ui');

    container.innerHTML += `
      <div style="display:flex; justify-content: space-between;">

        <h3>Path ${data.index}</h3>

        <button data-button="remove-path">X</button>

      </div>
    `;

    const pointsList = document.createElement('ul');
    pointsList.classList.add('path-ui__points-list');

    for(let i = 0; i < data.points.length; i++) {
      pointsList.innerHTML += `
        <li class="path-ui__point">

          <button class="focus-button" data-focus-button="${i}">P${i}</button>

          <div class="double-input-container">
      
            <label>
              <span>x:</span>
              <input data-point-input="${i}-x" type="number" value="${data.points[i].x}" step="50" min="-1000" max="1000">
            </label>
      
            <label>
              <span>y:</span>
              <input data-point-input="${i}-y" type="number" value="${data.points[i].y}" step="50" min="-1000" max="1000">
            </label>
      
          </div>

        </li>
      `;
    }

      container.append(pointsList);

      container.innerHTML += `<button data-button="reset-path">RESET</button>`;

      container.innerHTML += `
        <section class="inner-group-container">
          <textarea data-text-input="textContent">My Curved Text :)</textarea>
        </section>
      `;

      container.innerHTML += `
        <section class="inner-group-container">

          <div class="double-input-container">
      
            <label>
              <span>x:</span>
              <input data-text-input="x" type="number" step="50" min="-1000" max="1000">
            </label>
      
            <label>
              <span>size:</span>
              <input data-text-input="size" type="number" step="4" min="1" max="600"></input>
            </label>
      
          </div>
      
        </section>
      `;

      container.innerHTML += `
        <section class="inner-group-container">
          <textarea data-text-input="style" placeholder="letter-spacing, fill, etc."></textarea>
        </section>
      `;

    this.controlsContainer.append(container);
  }

  removePathUI(data) {
    console.log(data)
    document.querySelector(`[data-path-ui="${data.index}"]`).remove();
  }

}