export default null;

(function addFontChangeListener() {
  const styleSheet = new CSSStyleSheet();
  document.adoptedStyleSheets.push(styleSheet);
  
  const fileInput = document.querySelector('[data-text-input="file"]');
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