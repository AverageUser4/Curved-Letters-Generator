import pathAndTextHandler from './classes/PathAndTextHandler.js';
import textHandler from './classes/TextHandler.js';

// meant to make each input update one another
const allInputContainers = document.querySelectorAll('[data-number-and-range]');
for(let val of allInputContainers) {
  const number = val.querySelector('input[type="number"]');
  const range = val.querySelector('input[type="range"]');

  number.addEventListener('input', (event) => onInputUpdate(event));
  range.addEventListener('input', (event) => onInputUpdate(event));
}

function onInputUpdate(event) {
  const ct = event.currentTarget;
  const value = ct.value;
  
  for(let val of ct.parentElement.querySelectorAll('input'))
    val.value = value;
}