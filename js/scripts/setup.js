export default null;

(function randomiseId() {
  const path = document.querySelector('[data-path]');
  const textPath = document.querySelector('[data-text-path]');
  const id = `ctg-text-path-${Math.random().toFixed(5)}`;
  path.setAttributeNS(null, 'id', id);
  textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id);
})();

(function syncAdjacentInput() {
  for(let val of document.querySelectorAll('[data-number-and-range]'))
    for(let val_2 of val.querySelectorAll('[type="number"], [type="range"]'))
      val_2.addEventListener('input', (event) => {
        const ct = event.currentTarget;
        const value = ct.value;
        
        for(let val of ct.parentElement.querySelectorAll('input'))
          val.value = value;
      });
})();

(function handleFontFamily() {
  const styleSheet = new CSSStyleSheet();
  document.adoptedStyleSheets.push(styleSheet);
  
  const fileInput = document.querySelector('[type="file"]');
  const reader = new FileReader();

  reader.addEventListener('load', (event) => {
    styleSheet.replace(`
      @font-face {
        font-family: user-custom;
        src: url(${event.target.result});
      }
    `);
  });

  fileInput.addEventListener('change', () => {
    reader.readAsDataURL(fileInput.files[0]);
  });
})()