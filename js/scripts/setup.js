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